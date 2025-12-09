import { Response } from "express";
import mongoose from "mongoose";
import { Student } from "../models/Student";
import { Room } from "../models/Room";
import { Warden } from "../models/Warden";
import { Attendance } from "../models/Attendance";
import { Fee } from "../models/Fee";
import { Leave } from "../models/Leave";
import { Visitor } from "../models/Visitor";
import { Complaint } from "../models/Complaint";
import { Notification } from "../models/Notification";
import { AuthRequest } from "../middleware/auth";
import { successResponse, errorResponse } from "../utils/response";

export const getAdminDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalStudents = await Student.countDocuments({ status: "active" });
    const totalRooms = await Room.countDocuments();
    
    const rooms = await Room.find();
    const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
    const totalOccupied = rooms.reduce((acc, r) => acc + r.occupied, 0);
    const availableBeds = totalCapacity - totalOccupied;

    const pendingFees = await Fee.countDocuments({ status: { $in: ["pending", "overdue"] } });

    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = await Attendance.find({ date: today });
    const presentCount = todayAttendance.filter((a) => a.status === "present").length;
    const todayAttendancePercentage = todayAttendance.length > 0 
      ? Math.round((presentCount / todayAttendance.length) * 100) 
      : 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const visitorCountToday = await Visitor.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    const activeLeaveRequests = await Leave.countDocuments({ status: "pending" });
    const openComplaints = await Complaint.countDocuments({ status: { $ne: "resolved" } });

    const blocks = ["A", "B", "C", "D"] as const;
    const blockStats = await Promise.all(
      blocks.map(async (block) => {
        const studentCount = await Student.countDocuments({ block, status: "active" });
        const roomCount = await Room.countDocuments({ block });
        const warden = await Warden.findOne({ block });
        
        return {
          block,
          studentCount,
          roomCount,
          wardenName: warden?.name || "Not Assigned",
          wardenMobile: warden?.mobile || "N/A",
        };
      })
    );

    successResponse(res, {
      totalStudents,
      totalRooms,
      availableBeds,
      pendingFees,
      todayAttendancePercentage,
      visitorCountToday,
      activeLeaveRequests,
      openComplaints,
      blockStats,
    });
  } catch (error) {
    console.error("Get admin dashboard stats error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getWardenDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const block = req.userBlock || (req.query.block as string);

    if (!block) {
      errorResponse(res, "Block is required", 400);
      return;
    }

    const totalStudents = await Student.countDocuments({ block, status: "active" });
    const totalRooms = await Room.countDocuments({ block });

    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = await Attendance.find({ block, date: today });
    const presentToday = todayAttendance.filter((a) => a.status === "present").length;
    const absentToday = todayAttendance.filter((a) => a.status === "absent").length;
    const pendingAttendance = totalStudents - todayAttendance.length;

    const activeLeaves = await Leave.countDocuments({ block, status: "approved" });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const visitorsToday = await Visitor.countDocuments({
      block,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    successResponse(res, {
      block,
      totalStudents,
      totalRooms,
      presentToday,
      absentToday,
      pendingAttendance,
      activeLeaves,
      visitorsToday,
    });
  } catch (error) {
    console.error("Get warden dashboard stats error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getStudentDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    let student = null as any;
    if (mongoose.isValidObjectId(studentId)) {
      student = await Student.findById(studentId);
    } else {
      student = await Student.findOne({ studentId });
    }

    if (!student) {
      errorResponse(res, "Student not found", 404);
      return;
    }

    const room = student.roomId ? await Room.findById(student.roomId) : null;
    const warden = await Warden.findOne({ block: student.block });

    const roommates: string[] = [];
    if (room) {
      const studentsInRoom = await Student.find({
        roomId: room._id,
        _id: { $ne: student._id },
        status: "active",
      });
      roommates.push(...studentsInRoom.map((s) => s.name));
    }

    const fee = await Fee.findOne({ studentId: student._id });
    const totalFee = fee?.totalAmount || 0;
    const paidFee = fee?.paidAmount || 0;
    const pendingFee = totalFee - paidFee;
    const dueDate = fee?.dueDate?.toISOString().split("T")[0] || "";

    const today = new Date().toISOString().split("T")[0];
    const todayAttendanceRecord = await Attendance.findOne({
      studentId: student._id,
      date: today,
    });
    const todayAttendance = todayAttendanceRecord?.status || "not_marked";

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyAttendance = await Attendance.find({
      studentId: student._id,
      date: { $regex: `^${currentMonth}` },
    });
    const presentDays = monthlyAttendance.filter((a) => a.status === "present").length;
    const monthlyAttendancePercentage = monthlyAttendance.length > 0
      ? Math.round((presentDays / monthlyAttendance.length) * 100)
      : 0;

    const totalLeaves = await Leave.countDocuments({ studentId: student._id });
    const pendingLeaves = await Leave.countDocuments({ studentId: student._id, status: "pending" });

    const unreadNotifications = await Notification.countDocuments({
      read: false,
      $or: [
        { targetType: "all_students" },
        { targetType: "block_students", targetBlock: student.block },
        { targetType: "individual", targetId: student._id },
      ],
    });

    successResponse(res, {
      studentId: student.studentId,
      name: student.name,
      block: student.block,
      roomNumber: student.roomNumber || "Not Assigned",
      floor: room?.floor || 0,
      bedNumber: student.bedNumber || 0,
      roommates,
      wardenName: warden?.name || "Not Assigned",
      wardenMobile: warden?.mobile || "N/A",
      totalFee,
      paidFee,
      pendingFee,
      dueDate,
      todayAttendance,
      monthlyAttendancePercentage,
      totalLeaves,
      pendingLeaves,
      unreadNotifications,
    });
  } catch (error) {
    console.error("Get student dashboard stats error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getMonthlyChartData = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        yearMonth: date.toISOString().slice(0, 7),
      });
    }

    const chartData = await Promise.all(
      months.map(async ({ month, yearMonth }) => {
        const attendance = await Attendance.find({ date: { $regex: `^${yearMonth}` } });
        const presentCount = attendance.filter((a) => a.status === "present").length;
        const attendancePercentage = attendance.length > 0
          ? Math.round((presentCount / attendance.length) * 100)
          : 0;

        const fees = await Fee.find();
        const feesTotal = fees.reduce((acc, f) => acc + f.totalAmount, 0);
        const feesPaid = fees.reduce((acc, f) => acc + f.paidAmount, 0);
        const feesPercentage = feesTotal > 0 ? Math.round((feesPaid / feesTotal) * 100) : 0;

        const rooms = await Room.find();
        const capacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
        const occupied = rooms.reduce((acc, r) => acc + r.occupied, 0);
        const occupancyPercentage = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;

        const startOfMonth = new Date(`${yearMonth}-01`);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        const visitors = await Visitor.countDocuments({
          createdAt: { $gte: startOfMonth, $lt: endOfMonth },
        });

        const complaints = await Complaint.countDocuments({
          createdAt: { $gte: startOfMonth, $lt: endOfMonth },
        });

        return {
          month,
          attendance: attendancePercentage,
          fees: feesPercentage,
          occupancy: occupancyPercentage,
          visitors,
          complaints,
        };
      })
    );

    successResponse(res, chartData);
  } catch (error) {
    console.error("Get monthly chart data error:", error);
    errorResponse(res, "Server error", 500);
  }
};
