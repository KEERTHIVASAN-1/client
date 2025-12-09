import { Response } from "express";
import mongoose from "mongoose";
import { Fee } from "../models/Fee";
import { Student } from "../models/Student";
import { AuthRequest } from "../middleware/auth";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response";

export const getAllFees = async (req: AuthRequest, res: Response): Promise<void> => {
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
      if (mongoose.isValidObjectId(studentId as string)) {
        query.studentId = new mongoose.Types.ObjectId(studentId as string);
      } else {
        query.studentIdNumber = studentId;
      }
    }

    const total = await Fee.countDocuments(query);
    const fees = await Fee.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSizeNum)
      .limit(pageSizeNum);

    const formattedFees = fees.map((f) => ({
      id: f._id.toString(),
      studentId: f.studentId.toString(),
      studentName: f.studentName,
      studentIdNumber: f.studentIdNumber,
      block: f.block,
      totalAmount: f.totalAmount,
      paidAmount: f.paidAmount,
      dueDate: f.dueDate.toISOString().split("T")[0],
      status: f.status,
      createdAt: f.createdAt.toISOString(),
    }));

    paginatedResponse(res, formattedFees, total, pageNum, pageSizeNum);
  } catch (error) {
    console.error("Get all fees error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getFeeByStudentId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    let fee = null as any;
    if (mongoose.isValidObjectId(studentId)) {
      fee = await Fee.findOne({ studentId: new mongoose.Types.ObjectId(studentId) });
    } else {
      fee = await Fee.findOne({ studentIdNumber: studentId });
    }

    if (!fee) {
      successResponse(res, null);
      return;
    }

    const formattedFee = {
      id: fee._id.toString(),
      studentId: fee.studentId.toString(),
      studentName: fee.studentName,
      studentIdNumber: fee.studentIdNumber,
      block: fee.block,
      totalAmount: fee.totalAmount,
      paidAmount: fee.paidAmount,
      dueDate: fee.dueDate.toISOString().split("T")[0],
      status: fee.status,
      createdAt: fee.createdAt.toISOString(),
    };

    successResponse(res, formattedFee);
  } catch (error) {
    console.error("Get fee by student ID error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const createFee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, totalAmount, dueDate } = req.body;

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

    const fee = new Fee({
      studentId: student._id,
      studentName: student.name,
      studentIdNumber: student.studentId,
      block: student.block,
      totalAmount,
      paidAmount: 0,
      dueDate: new Date(dueDate),
      status: "pending",
    });
    await fee.save();

    const formattedFee = {
      id: fee._id.toString(),
      studentId: fee.studentId.toString(),
      studentName: fee.studentName,
      studentIdNumber: fee.studentIdNumber,
      block: fee.block,
      totalAmount: fee.totalAmount,
      paidAmount: fee.paidAmount,
      dueDate: fee.dueDate.toISOString().split("T")[0],
      status: fee.status,
      createdAt: fee.createdAt.toISOString(),
    };

    successResponse(res, formattedFee, "Fee record created successfully", 201);
  } catch (error) {
    console.error("Create fee error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const fee = await Fee.findById(id);
    if (!fee) {
      errorResponse(res, "Fee record not found", 404);
      return;
    }

    const newPaidAmount = fee.paidAmount + amount;
    const status = newPaidAmount >= fee.totalAmount ? "paid" : "pending";

    const updatedFee = await Fee.findByIdAndUpdate(
      id,
      { paidAmount: newPaidAmount, status },
      { new: true }
    );

    if (!updatedFee) {
      errorResponse(res, "Failed to update fee", 500);
      return;
    }

    const formattedFee = {
      id: updatedFee._id.toString(),
      studentId: updatedFee.studentId.toString(),
      studentName: updatedFee.studentName,
      studentIdNumber: updatedFee.studentIdNumber,
      block: updatedFee.block,
      totalAmount: updatedFee.totalAmount,
      paidAmount: updatedFee.paidAmount,
      dueDate: updatedFee.dueDate.toISOString().split("T")[0],
      status: updatedFee.status,
      createdAt: updatedFee.createdAt.toISOString(),
    };

    successResponse(res, formattedFee, "Payment recorded successfully");
  } catch (error) {
    console.error("Record payment error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const updateFeeStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedFee = await Fee.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedFee) {
      errorResponse(res, "Fee record not found", 404);
      return;
    }

    const formattedFee = {
      id: updatedFee._id.toString(),
      studentId: updatedFee.studentId.toString(),
      studentName: updatedFee.studentName,
      studentIdNumber: updatedFee.studentIdNumber,
      block: updatedFee.block,
      totalAmount: updatedFee.totalAmount,
      paidAmount: updatedFee.paidAmount,
      dueDate: updatedFee.dueDate.toISOString().split("T")[0],
      status: updatedFee.status,
      createdAt: updatedFee.createdAt.toISOString(),
    };

    successResponse(res, formattedFee, "Fee status updated");
  } catch (error) {
    console.error("Update fee status error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getFeeStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fees = await Fee.find();

    const stats = {
      total: fees.reduce((acc, f) => acc + f.totalAmount, 0),
      paid: fees.filter((f) => f.status === "paid").reduce((acc, f) => acc + f.paidAmount, 0),
      pending: fees.filter((f) => f.status === "pending").reduce((acc, f) => acc + (f.totalAmount - f.paidAmount), 0),
      overdue: fees.filter((f) => f.status === "overdue").reduce((acc, f) => acc + (f.totalAmount - f.paidAmount), 0),
    };

    successResponse(res, stats);
  } catch (error) {
    console.error("Get fee stats error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const updateFee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { totalAmount, dueDate, status } = req.body as { totalAmount?: number; dueDate?: string; status?: string };

    const update: any = {};
    if (typeof totalAmount === "number") update.totalAmount = totalAmount;
    if (typeof dueDate === "string") update.dueDate = new Date(dueDate);
    if (typeof status === "string") update.status = status;

    const fee = await Fee.findById(id);
    if (!fee) {
      errorResponse(res, "Fee record not found", 404);
      return;
    }

    if (update.totalAmount !== undefined) {
      const newStatus = (fee.paidAmount >= update.totalAmount) ? "paid" : (update.status || fee.status);
      update.status = newStatus;
    }

    const updatedFee = await Fee.findByIdAndUpdate(id, update, { new: true });
    if (!updatedFee) {
      errorResponse(res, "Failed to update fee", 500);
      return;
    }

    const formattedFee = {
      id: updatedFee._id.toString(),
      studentId: updatedFee.studentId.toString(),
      studentName: updatedFee.studentName,
      studentIdNumber: updatedFee.studentIdNumber,
      block: updatedFee.block,
      totalAmount: updatedFee.totalAmount,
      paidAmount: updatedFee.paidAmount,
      dueDate: updatedFee.dueDate.toISOString().split("T")[0],
      status: updatedFee.status,
      createdAt: updatedFee.createdAt.toISOString(),
    };

    successResponse(res, formattedFee, "Fee updated");
  } catch (error) {
    console.error("Update fee error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const deleteFee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const fee = await Fee.findByIdAndDelete(id);
    if (!fee) {
      errorResponse(res, "Fee record not found", 404);
      return;
    }
    successResponse(res, { id }, "Fee deleted");
  } catch (error) {
    console.error("Delete fee error:", error);
    errorResponse(res, "Server error", 500);
  }
};
