import { Request, Response } from "express";
import { User } from "../models/User";
import { Warden } from "../models/Warden";
import { Student } from "../models/Student";
import {
  AuthRequest,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../middleware/auth";
import { successResponse, errorResponse } from "../utils/response";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      errorResponse(res, "Email, password, and role are required", 400);
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase(), role });
    if (!user) {
      errorResponse(res, "Invalid credentials", 401);
      return;
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      errorResponse(res, "Invalid credentials", 401);
      return;
    }

    let block: string | undefined;
    let studentId: string | undefined;

    if (role === "warden") {
      const warden = await Warden.findOne({ userId: user._id });
      block = warden?.block;
    } else if (role === "student") {
      const student = await Student.findOne({ userId: user._id });
      if (student?.status !== "active") {
        errorResponse(res, "Account is not active", 401);
        return;
      }
      block = student?.block;
      studentId = student?.studentId;
    }

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString(), user.role);

    const authUser = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      mobile: user.mobile,
      block,
      studentId,
    };

    successResponse(res, {
      user: authUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    errorResponse(res, "Server error during login", 500);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  successResponse(res, null, "Logged out successfully");
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      errorResponse(res, "Refresh token required", 400);
      return;
    }

    const payload = verifyRefreshToken(token);
    if (!payload) {
      errorResponse(res, "Invalid refresh token", 401);
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      errorResponse(res, "User not found", 401);
      return;
    }

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const newRefreshToken = generateRefreshToken(user._id.toString(), user.role);

    successResponse(res, {
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, "Not authenticated", 401);
      return;
    }

    let block: string | undefined;
    let studentId: string | undefined;

    if (req.user.role === "warden") {
      const warden = await Warden.findOne({ userId: req.user._id });
      block = warden?.block;
    } else if (req.user.role === "student") {
      const student = await Student.findOne({ userId: req.user._id });
      block = student?.block;
      studentId = student?.studentId;
    }

    const authUser = {
      id: req.user._id.toString(),
      email: req.user.email,
      role: req.user.role,
      name: req.user.name,
      mobile: req.user.mobile,
      block,
      studentId,
    };

    successResponse(res, authUser);
  } catch (error) {
    console.error("Get profile error:", error);
    errorResponse(res, "Server error", 500);
  }
};
