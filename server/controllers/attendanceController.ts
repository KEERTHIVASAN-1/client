import { Response } from "express";
import mongoose from "mongoose";
import { Attendance } from "../models/Attendance";
import { Student } from "../models/Student";
import { AuthRequest } from "../middleware/auth";
import { successResponse, errorResponse } from "../utils/response";

export const getAttendanceByDate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, block } = req.query;

    const query: any = {};
    if (date) query.date = date;
    
    if (req.user?.role === "warden" && req.userBlock) {
      query.block = req.userBlock;
    } else if (block) {
      query.block = block;
    }

    const records = await Attendance.find(query).sort({ studentName: 1 });

    const formattedRecords = records.map((a) => ({
      id: a._id.toString(),
      studentId: a.studentId.toString(),
      studentIdNumber: a.studentIdNumber,
      studentName: a.studentName,
      block: a.block,
      roomNumber: a.roomNumber,
      date: a.date,
      status: a.status,
      markedBy: a.markedBy.toString(),
      createdAt: a.createdAt.toISOString(),
    }));

    successResponse(res, formattedRecords);
  } catch (error) {
    console.error("Get attendance by date error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getAttendanceByStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { month } = req.query;

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

    const query: any = {
      $or: [{ studentId: student._id }, { studentIdNumber: student.studentId }],
    };

    if (month) {
      query.date = { $regex: `^${month}` };
    }

    const records = await Attendance.find(query).sort({ date: -1 });

    const formattedRecords = records.map((a) => ({
      id: a._id.toString(),
      studentId: a.studentId.toString(),
      studentIdNumber: a.studentIdNumber,
      studentName: a.studentName,
      block: a.block,
      roomNumber: a.roomNumber,
      date: a.date,
      status: a.status,
      markedBy: a.markedBy.toString(),
      createdAt: a.createdAt.toISOString(),
    }));

    successResponse(res, formattedRecords);
  } catch (error) {
    console.error("Get attendance by student error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getStudentsForAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { block, date } = req.query;

    const targetBlock = req.user?.role === "warden" ? req.userBlock : block;

    if (!targetBlock || !date) {
      errorResponse(res, "Block and date are required", 400);
      return;
    }

    const students = await Student.find({ block: targetBlock, status: "active" }).sort({ name: 1 });
    const existingRecords = await Attendance.find({ block: targetBlock, date });

    const attendanceRecords = students.map((student) => {
      const existing = existingRecords.find(
        (a) => a.studentId.toString() === student._id.toString()
      );
      return {
        studentId: student._id.toString(),
        studentIdNumber: student.studentId,
        studentName: student.name,
        roomNumber: student.roomNumber || "",
        status: existing?.status || "present",
      };
    });

    successResponse(res, attendanceRecords);
  } catch (error) {
    console.error("Get students for attendance error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const markBulkAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { block, date, records } = req.body;

    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const targetBlock = req.user.role === "warden" ? req.userBlock : block;

    if (!targetBlock || !date || !records) {
      errorResponse(res, "Block, date, and records are required", 400);
      return;
    }

    await Attendance.deleteMany({ block: targetBlock, date });

    const prepared: any[] = [];
    for (const record of records as any[]) {
      let studentDoc = null;
      if (record.studentId && mongoose.isValidObjectId(record.studentId)) {
        studentDoc = await Student.findById(record.studentId);
      } else if (record.studentIdNumber) {
        studentDoc = await Student.findOne({ studentId: record.studentIdNumber });
      }

      if (!studentDoc) {
        continue;
      }

      prepared.push({
        studentId: studentDoc._id,
        studentIdNumber: studentDoc.studentId,
        studentName: studentDoc.name,
        block: targetBlock,
        roomNumber: record.roomNumber || studentDoc.roomNumber || "",
        date,
        status: record.status || "present",
        markedBy: req.user!._id,
      });
    }

    const savedRecords = await Attendance.insertMany(prepared);

    const formattedRecords = savedRecords.map((a) => ({
      id: a._id.toString(),
      studentId: a.studentId.toString(),
      studentIdNumber: a.studentIdNumber,
      studentName: a.studentName,
      block: a.block,
      roomNumber: a.roomNumber,
      date: a.date,
      status: a.status,
      markedBy: a.markedBy.toString(),
      createdAt: a.createdAt.toISOString(),
    }));

    successResponse(res, formattedRecords, "Attendance marked successfully");
  } catch (error) {
    console.error("Mark bulk attendance error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getAttendanceStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { block, month } = req.query;

    const query: any = {};
    if (block) query.block = block;
    if (month) query.date = { $regex: `^${month}` };

    const records = await Attendance.find(query);

    const presentCount = records.filter((a) => a.status === "present").length;
    const total = records.length;
    const uniqueDates = new Set(records.map((a) => a.date));

    successResponse(res, {
      totalDays: uniqueDates.size,
      averageAttendance: total > 0 ? Math.round((presentCount / total) * 100) : 0,
      presentCount,
      absentCount: total - presentCount,
    });
  } catch (error) {
    console.error("Get attendance stats error:", error);
    errorResponse(res, "Server error", 500);
  }
};
