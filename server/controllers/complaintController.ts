import { Response } from "express";
import { Complaint } from "../models/Complaint";
import mongoose from "mongoose";
import { Student } from "../models/Student";
import { getNextComplaintId } from "../models/Counter";
import { AuthRequest } from "../middleware/auth";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response";

export const getAllComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10, block, status, search, studentId } = req.query;
    const pageNum = parseInt(page as string, 10);
    const pageSizeNum = parseInt(pageSize as string, 10);

    const query: any = {};

    if (block) query.block = block;
    if (status) query.status = status;

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { complaintId: searchRegex },
        { studentIdNumber: searchRegex },
        { studentName: searchRegex },
        { title: searchRegex },
      ];
    }

    if (studentId) {
      if (mongoose.isValidObjectId(studentId as string)) {
        query.studentId = new mongoose.Types.ObjectId(studentId as string);
      } else {
        query.studentIdNumber = studentId;
      }
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSizeNum)
      .limit(pageSizeNum);

    const formattedComplaints = complaints.map((c) => ({
      id: c._id.toString(),
      complaintId: c.complaintId,
      studentId: c.studentId.toString(),
      studentIdNumber: c.studentIdNumber,
      studentName: c.studentName,
      studentMobile: c.studentMobile,
      block: c.block,
      roomNumber: c.roomNumber,
      category: c.category,
      title: c.title,
      description: c.description,
      status: c.status,
      adminNote: c.adminNote,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    paginatedResponse(res, formattedComplaints, total, pageNum, pageSizeNum);
  } catch (error) {
    console.error("Get all complaints error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getComplaintById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findOne({
      $or: [{ _id: id }, { complaintId: id }],
    });

    if (!complaint) {
      errorResponse(res, "Complaint not found", 404);
      return;
    }

    const formattedComplaint = {
      id: complaint._id.toString(),
      complaintId: complaint.complaintId,
      studentId: complaint.studentId.toString(),
      studentIdNumber: complaint.studentIdNumber,
      studentName: complaint.studentName,
      studentMobile: complaint.studentMobile,
      block: complaint.block,
      roomNumber: complaint.roomNumber,
      category: complaint.category,
      title: complaint.title,
      description: complaint.description,
      status: complaint.status,
      adminNote: complaint.adminNote,
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
    };

    successResponse(res, formattedComplaint);
  } catch (error) {
    console.error("Get complaint by ID error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getComplaintsByStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const query: any = {};
    if (mongoose.isValidObjectId(studentId)) {
      query.studentId = new mongoose.Types.ObjectId(studentId);
    } else {
      query.studentIdNumber = studentId;
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });

    const formattedComplaints = complaints.map((c) => ({
      id: c._id.toString(),
      complaintId: c.complaintId,
      studentId: c.studentId.toString(),
      studentIdNumber: c.studentIdNumber,
      studentName: c.studentName,
      studentMobile: c.studentMobile,
      block: c.block,
      roomNumber: c.roomNumber,
      category: c.category,
      title: c.title,
      description: c.description,
      status: c.status,
      adminNote: c.adminNote,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    successResponse(res, formattedComplaints);
  } catch (error) {
    console.error("Get complaints by student error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const createComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { category, title, description } = req.body;

    let student = null as any;
    if (mongoose.isValidObjectId(studentId)) {
      student = await Student.findById(studentId);
    } else {
      student = await Student.findOne({ studentId: studentId, status: "active" });
    }
    if (!student) {
      errorResponse(res, "Student not found", 404);
      return;
    }

    const complaintId = await getNextComplaintId();

    const complaint = new Complaint({
      complaintId,
      studentId: student._id,
      studentIdNumber: student.studentId,
      studentName: student.name,
      studentMobile: student.mobile,
      block: student.block,
      roomNumber: student.roomNumber || "",
      category,
      title,
      description,
      status: "new",
    });
    await complaint.save();

    const formattedComplaint = {
      id: complaint._id.toString(),
      complaintId: complaint.complaintId,
      studentId: complaint.studentId.toString(),
      studentIdNumber: complaint.studentIdNumber,
      studentName: complaint.studentName,
      studentMobile: complaint.studentMobile,
      block: complaint.block,
      roomNumber: complaint.roomNumber,
      category: complaint.category,
      title: complaint.title,
      description: complaint.description,
      status: complaint.status,
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
    };

    successResponse(res, formattedComplaint, "Complaint submitted", 201);
  } catch (error) {
    console.error("Create complaint error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const updateComplaintStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status, adminNote },
      { new: true }
    );

    if (!complaint) {
      errorResponse(res, "Complaint not found", 404);
      return;
    }

    const formattedComplaint = {
      id: complaint._id.toString(),
      complaintId: complaint.complaintId,
      studentId: complaint.studentId.toString(),
      studentIdNumber: complaint.studentIdNumber,
      studentName: complaint.studentName,
      studentMobile: complaint.studentMobile,
      block: complaint.block,
      roomNumber: complaint.roomNumber,
      category: complaint.category,
      title: complaint.title,
      description: complaint.description,
      status: complaint.status,
      adminNote: complaint.adminNote,
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
    };

    successResponse(res, formattedComplaint, "Complaint status updated");
  } catch (error) {
    console.error("Update complaint status error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const deleteComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      errorResponse(res, "Complaint not found", 404);
      return;
    }

    await Complaint.findByIdAndDelete(id);
    successResponse(res, null, "Complaint deleted");
  } catch (error) {
    console.error("Delete complaint error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getComplaintStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const complaints = await Complaint.find();

    const stats = {
      new: complaints.filter((c) => c.status === "new").length,
      inProgress: complaints.filter((c) => c.status === "in_progress").length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
      total: complaints.length,
    };

    successResponse(res, stats);
  } catch (error) {
    console.error("Get complaint stats error:", error);
    errorResponse(res, "Server error", 500);
  }
};
