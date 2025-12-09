import { Response } from "express";
import mongoose from "mongoose";
import { Visitor } from "../models/Visitor";
import { Student } from "../models/Student";
import { AuthRequest } from "../middleware/auth";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response";

export const getAllVisitors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10, block, date, search, studentId } = req.query;
    const pageNum = parseInt(page as string, 10);
    const pageSizeNum = parseInt(pageSize as string, 10);

    const query: any = {};

    if (req.user?.role === "warden" && req.userBlock) {
      query.block = req.userBlock;
    } else if (block) {
      query.block = block;
    }

    if (date) {
      const startOfDay = new Date(date as string);
      const endOfDay = new Date(date as string);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query.createdAt = { $gte: startOfDay, $lt: endOfDay };
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { visitorName: searchRegex },
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

    const total = await Visitor.countDocuments(query);
    const visitors = await Visitor.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSizeNum)
      .limit(pageSizeNum);

    const formattedVisitors = visitors.map((v) => ({
      id: v._id.toString(),
      visitorName: v.visitorName,
      studentId: v.studentId.toString(),
      studentIdNumber: v.studentIdNumber,
      studentName: v.studentName,
      block: v.block,
      purpose: v.purpose,
      inTime: v.inTime.toISOString(),
      outTime: v.outTime?.toISOString(),
      createdAt: v.createdAt.toISOString(),
    }));

    paginatedResponse(res, formattedVisitors, total, pageNum, pageSizeNum);
  } catch (error) {
    console.error("Get all visitors error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getVisitorsByStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const query: any = {};
    if (mongoose.isValidObjectId(studentId)) {
      query.studentId = new mongoose.Types.ObjectId(studentId);
    } else {
      query.studentIdNumber = studentId;
    }

    const visitors = await Visitor.find(query).sort({ createdAt: -1 });

    const formattedVisitors = visitors.map((v) => ({
      id: v._id.toString(),
      visitorName: v.visitorName,
      studentId: v.studentId.toString(),
      studentIdNumber: v.studentIdNumber,
      studentName: v.studentName,
      block: v.block,
      purpose: v.purpose,
      inTime: v.inTime.toISOString(),
      outTime: v.outTime?.toISOString(),
      createdAt: v.createdAt.toISOString(),
    }));

    successResponse(res, formattedVisitors);
  } catch (error) {
    console.error("Get visitors by student error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const checkIn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { visitorName, studentIdNumber, purpose } = req.body;

    const student = await Student.findOne({ studentId: studentIdNumber, status: "active" });
    if (!student) {
      errorResponse(res, "Student not found with the given ID", 404);
      return;
    }

    const visitor = new Visitor({
      visitorName,
      studentId: student._id,
      studentIdNumber: student.studentId,
      studentName: student.name,
      block: student.block,
      purpose,
      inTime: new Date(),
    });
    await visitor.save();

    const formattedVisitor = {
      id: visitor._id.toString(),
      visitorName: visitor.visitorName,
      studentId: visitor.studentId.toString(),
      studentIdNumber: visitor.studentIdNumber,
      studentName: visitor.studentName,
      block: visitor.block,
      purpose: visitor.purpose,
      inTime: visitor.inTime.toISOString(),
      createdAt: visitor.createdAt.toISOString(),
    };

    successResponse(res, formattedVisitor, "Visitor checked in", 201);
  } catch (error) {
    console.error("Check in error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const checkOut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const visitor = await Visitor.findByIdAndUpdate(
      id,
      { outTime: new Date() },
      { new: true }
    );

    if (!visitor) {
      errorResponse(res, "Visitor not found", 404);
      return;
    }

    const formattedVisitor = {
      id: visitor._id.toString(),
      visitorName: visitor.visitorName,
      studentId: visitor.studentId.toString(),
      studentIdNumber: visitor.studentIdNumber,
      studentName: visitor.studentName,
      block: visitor.block,
      purpose: visitor.purpose,
      inTime: visitor.inTime.toISOString(),
      outTime: visitor.outTime?.toISOString(),
      createdAt: visitor.createdAt.toISOString(),
    };

    successResponse(res, formattedVisitor, "Visitor checked out");
  } catch (error) {
    console.error("Check out error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const deleteVisitor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const visitor = await Visitor.findById(id);
    if (!visitor) {
      errorResponse(res, "Visitor not found", 404);
      return;
    }

    await Visitor.findByIdAndDelete(id);
    successResponse(res, null, "Visitor deleted");
  } catch (error) {
    console.error("Delete visitor error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getTodayByBlock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const block = req.user?.role === "warden" ? req.userBlock : req.params.block;

    if (!block) {
      errorResponse(res, "Block is required", 400);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const visitors = await Visitor.find({
      block,
      createdAt: { $gte: today, $lt: tomorrow },
    }).sort({ createdAt: -1 });

    const formattedVisitors = visitors.map((v) => ({
      id: v._id.toString(),
      visitorName: v.visitorName,
      studentId: v.studentId.toString(),
      studentIdNumber: v.studentIdNumber,
      studentName: v.studentName,
      block: v.block,
      purpose: v.purpose,
      inTime: v.inTime.toISOString(),
      outTime: v.outTime?.toISOString(),
      createdAt: v.createdAt.toISOString(),
    }));

    successResponse(res, formattedVisitors);
  } catch (error) {
    console.error("Get today visitors by block error:", error);
    errorResponse(res, "Server error", 500);
  }
};
