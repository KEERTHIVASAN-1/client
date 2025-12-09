import { Response } from "express";
import mongoose from "mongoose";
import { Leave } from "../models/Leave";
import { Student } from "../models/Student";
import { AuthRequest } from "../middleware/auth";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response";

export const getAllLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10, block, status, search, studentId } = req.query;
    const pageNum = parseInt(page as string, 10);
    const pageSizeNum = parseInt(pageSize as string, 10);

    const query: any = {};

    if (req.user?.role === "warden" && req.userBlock) {
      query.block = req.userBlock;
    } else if (block) {
      query.block = block;
    }

    if (status) query.status = status;

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { studentIdNumber: searchRegex },
        { studentName: searchRegex },
      ];
    }

    if (studentId) {
      query.$or = [
        { studentId },
        { studentIdNumber: studentId },
      ];
    }

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSizeNum)
      .limit(pageSizeNum);

    const formattedLeaves = leaves.map((l) => ({
      id: l._id.toString(),
      studentId: l.studentId.toString(),
      studentIdNumber: l.studentIdNumber,
      studentName: l.studentName,
      block: l.block,
      roomNumber: l.roomNumber,
      startDate: l.startDate.toISOString().split("T")[0],
      endDate: l.endDate.toISOString().split("T")[0],
      reason: l.reason,
      status: l.status,
      approvedBy: l.approvedBy?.toString(),
      createdAt: l.createdAt.toISOString(),
    }));

    paginatedResponse(res, formattedLeaves, total, pageNum, pageSizeNum);
  } catch (error) {
    console.error("Get all leaves error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getLeavesByStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const query: any = {};
    if (mongoose.isValidObjectId(studentId)) {
      query.studentId = new mongoose.Types.ObjectId(studentId);
    } else {
      query.studentIdNumber = studentId;
    }

    const leaves = await Leave.find(query).sort({ createdAt: -1 });

    const formattedLeaves = leaves.map((l) => ({
      id: l._id.toString(),
      studentId: l.studentId.toString(),
      studentIdNumber: l.studentIdNumber,
      studentName: l.studentName,
      block: l.block,
      roomNumber: l.roomNumber,
      startDate: l.startDate.toISOString().split("T")[0],
      endDate: l.endDate.toISOString().split("T")[0],
      reason: l.reason,
      status: l.status,
      approvedBy: l.approvedBy?.toString(),
      createdAt: l.createdAt.toISOString(),
    }));

    successResponse(res, formattedLeaves);
  } catch (error) {
    console.error("Get leaves by student error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const createLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate, reason } = req.body;

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

    const leave = new Leave({
      studentId: student._id,
      studentIdNumber: student.studentId,
      studentName: student.name,
      block: student.block,
      roomNumber: student.roomNumber || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: "pending",
    });
    await leave.save();

    const formattedLeave = {
      id: leave._id.toString(),
      studentId: leave.studentId.toString(),
      studentIdNumber: leave.studentIdNumber,
      studentName: leave.studentName,
      block: leave.block,
      roomNumber: leave.roomNumber,
      startDate: leave.startDate.toISOString().split("T")[0],
      endDate: leave.endDate.toISOString().split("T")[0],
      reason: leave.reason,
      status: leave.status,
      createdAt: leave.createdAt.toISOString(),
    };

    successResponse(res, formattedLeave, "Leave request submitted", 201);
  } catch (error) {
    console.error("Create leave error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      errorResponse(res, "Leave request not found", 404);
      return;
    }

    if (req.user.role === "warden" && req.userBlock && leave.block !== req.userBlock) {
      errorResponse(res, "Access denied", 403);
      return;
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      { status, approvedBy: req.user._id },
      { new: true }
    );

    if (!updatedLeave) {
      errorResponse(res, "Failed to update leave", 500);
      return;
    }

    const formattedLeave = {
      id: updatedLeave._id.toString(),
      studentId: updatedLeave.studentId.toString(),
      studentIdNumber: updatedLeave.studentIdNumber,
      studentName: updatedLeave.studentName,
      block: updatedLeave.block,
      roomNumber: updatedLeave.roomNumber,
      startDate: updatedLeave.startDate.toISOString().split("T")[0],
      endDate: updatedLeave.endDate.toISOString().split("T")[0],
      reason: updatedLeave.reason,
      status: updatedLeave.status,
      approvedBy: updatedLeave.approvedBy?.toString(),
      createdAt: updatedLeave.createdAt.toISOString(),
    };

    successResponse(res, formattedLeave, "Leave status updated");
  } catch (error) {
    console.error("Update leave status error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getPendingByBlock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const block = req.user?.role === "warden" ? req.userBlock : req.params.block;

    if (!block) {
      errorResponse(res, "Block is required", 400);
      return;
    }

    const leaves = await Leave.find({ block, status: "pending" }).sort({ createdAt: -1 });

    const formattedLeaves = leaves.map((l) => ({
      id: l._id.toString(),
      studentId: l.studentId.toString(),
      studentIdNumber: l.studentIdNumber,
      studentName: l.studentName,
      block: l.block,
      roomNumber: l.roomNumber,
      startDate: l.startDate.toISOString().split("T")[0],
      endDate: l.endDate.toISOString().split("T")[0],
      reason: l.reason,
      status: l.status,
      createdAt: l.createdAt.toISOString(),
    }));

    successResponse(res, formattedLeaves);
  } catch (error) {
    console.error("Get pending leaves by block error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const deleteLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id);
    if (!leave) {
      errorResponse(res, "Leave request not found", 404);
      return;
    }

    await Leave.findByIdAndDelete(id);
    successResponse(res, null, "Leave request deleted");
  } catch (error) {
    console.error("Delete leave error:", error);
    errorResponse(res, "Server error", 500);
  }
};
