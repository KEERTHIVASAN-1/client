import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { Warden } from "../models/Warden";
import { Student } from "../models/Student";

export interface AuthRequest extends Request {
  user?: IUser;
  userBlock?: string;
  studentId?: string;
}

export interface JwtPayload {
  userId: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "super_secure_secret";

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Access token required" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    req.user = user;

    if (user.role === "warden") {
      const warden = await Warden.findOne({ userId: user._id });
      if (warden) {
        req.userBlock = warden.block;
      }
    } else if (user.role === "student") {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        req.userBlock = student.block;
        req.studentId = student._id.toString();
      }
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: "Invalid token" });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ success: false, message: "Admin access required" });
    return;
  }
  next();
};

export const requireWarden = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "warden") {
    res.status(403).json({ success: false, message: "Warden access required" });
    return;
  }
  next();
};

export const requireStudent = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "student") {
    res.status(403).json({ success: false, message: "Student access required" });
    return;
  }
  next();
};

export const requireAdminOrWarden = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "warden")) {
    res.status(403).json({ success: false, message: "Admin or Warden access required" });
    return;
  }
  next();
};

export const requireBlockOwnership = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  if (req.user.role === "admin") {
    next();
    return;
  }

  const requestedBlock = req.params.block || req.query.block || req.body.block;
  
  if (req.user.role === "warden" && requestedBlock && requestedBlock !== req.userBlock) {
    res.status(403).json({ success: false, message: "Access denied: You can only access your own block" });
    return;
  }

  next();
};

export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: string, role: string): string => {
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "super_secure_refresh_secret";
  return jwt.sign({ userId, role }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "super_secure_refresh_secret";
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};
