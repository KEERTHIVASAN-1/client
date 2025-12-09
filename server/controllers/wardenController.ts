import { Response } from "express";
import { User } from "../models/User";
import { Warden } from "../models/Warden";
import { AuthRequest } from "../middleware/auth";
import { successResponse, errorResponse } from "../utils/response";

export const getAllWardens = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wardens = await Warden.find().sort({ block: 1 });

    const formattedWardens = wardens.map((w) => ({
      id: w._id.toString(),
      userId: w.userId.toString(),
      name: w.name,
      email: w.email,
      mobile: w.mobile,
      block: w.block,
      createdAt: w.createdAt.toISOString(),
    }));

    successResponse(res, formattedWardens);
  } catch (error) {
    console.error("Get all wardens error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getWardenById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const warden = await Warden.findById(id);
    if (!warden) {
      errorResponse(res, "Warden not found", 404);
      return;
    }

    const formattedWarden = {
      id: warden._id.toString(),
      userId: warden.userId.toString(),
      name: warden.name,
      email: warden.email,
      mobile: warden.mobile,
      block: warden.block,
      createdAt: warden.createdAt.toISOString(),
    };

    successResponse(res, formattedWarden);
  } catch (error) {
    console.error("Get warden by ID error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getWardenByBlock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { block } = req.params;

    const warden = await Warden.findOne({ block });
    if (!warden) {
      successResponse(res, null);
      return;
    }

    const formattedWarden = {
      id: warden._id.toString(),
      userId: warden.userId.toString(),
      name: warden.name,
      email: warden.email,
      mobile: warden.mobile,
      block: warden.block,
      createdAt: warden.createdAt.toISOString(),
    };

    successResponse(res, formattedWarden);
  } catch (error) {
    console.error("Get warden by block error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const createWarden = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, mobile, block } = req.body;

    const existingWarden = await Warden.findOne({ block });
    if (existingWarden) {
      errorResponse(res, `Block ${block} already has a warden assigned`, 400);
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      errorResponse(res, "Email already in use", 400);
      return;
    }

    const user = new User({
      email: email.toLowerCase(),
      password: "warden123",
      role: "warden",
      name,
      mobile,
    });
    await user.save();

    const warden = new Warden({
      userId: user._id,
      name,
      email: email.toLowerCase(),
      mobile,
      block,
    });
    await warden.save();

    const formattedWarden = {
      id: warden._id.toString(),
      userId: warden.userId.toString(),
      name: warden.name,
      email: warden.email,
      mobile: warden.mobile,
      block: warden.block,
      createdAt: warden.createdAt.toISOString(),
    };

    successResponse(res, formattedWarden, "Warden created successfully", 201);
  } catch (error) {
    console.error("Create warden error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const updateWarden = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const warden = await Warden.findById(id);
    if (!warden) {
      errorResponse(res, "Warden not found", 404);
      return;
    }

    if (updates.block && updates.block !== warden.block) {
      const existingWarden = await Warden.findOne({ block: updates.block });
      if (existingWarden) {
        errorResponse(res, `Block ${updates.block} already has a warden assigned`, 400);
        return;
      }
    }

    if (updates.email && updates.email !== warden.email) {
      const existingUser = await User.findOne({ email: updates.email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== warden.userId.toString()) {
        errorResponse(res, "Email already in use", 400);
        return;
      }
      await User.findByIdAndUpdate(warden.userId, { email: updates.email.toLowerCase() });
    }

    if (updates.name) {
      await User.findByIdAndUpdate(warden.userId, { name: updates.name });
    }

    if (updates.mobile) {
      await User.findByIdAndUpdate(warden.userId, { mobile: updates.mobile });
    }

    const updatedWarden = await Warden.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedWarden) {
      errorResponse(res, "Failed to update warden", 500);
      return;
    }

    const formattedWarden = {
      id: updatedWarden._id.toString(),
      userId: updatedWarden.userId.toString(),
      name: updatedWarden.name,
      email: updatedWarden.email,
      mobile: updatedWarden.mobile,
      block: updatedWarden.block,
      createdAt: updatedWarden.createdAt.toISOString(),
    };

    successResponse(res, formattedWarden, "Warden updated successfully");
  } catch (error) {
    console.error("Update warden error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const deleteWarden = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const warden = await Warden.findById(id);
    if (!warden) {
      errorResponse(res, "Warden not found", 404);
      return;
    }

    await User.findByIdAndDelete(warden.userId);
    await Warden.findByIdAndDelete(id);

    successResponse(res, null, "Warden deleted successfully");
  } catch (error) {
    console.error("Delete warden error:", error);
    errorResponse(res, "Server error", 500);
  }
};
