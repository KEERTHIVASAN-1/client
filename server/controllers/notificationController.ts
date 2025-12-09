import { Response } from "express";
import mongoose from "mongoose";
import { Notification } from "../models/Notification";
import { Student } from "../models/Student";
import { AuthRequest } from "../middleware/auth";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response";

export const getAllNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10, targetType } = req.query;
    const pageNum = parseInt(page as string, 10);
    const pageSizeNum = parseInt(pageSize as string, 10);

    const query: any = {};
    if (targetType) query.targetType = targetType;

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSizeNum)
      .limit(pageSizeNum);

    const formattedNotifications = notifications.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      targetType: n.targetType,
      targetBlock: n.targetBlock,
      targetId: n.targetId?.toString(),
      sentBy: n.sentBy.toString(),
      sentByName: n.sentByName,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));

    paginatedResponse(res, formattedNotifications, total, pageNum, pageSizeNum);
  } catch (error) {
    console.error("Get all notifications error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getNotificationsForStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, block } = req.params;

    let studentDoc = null as any;
    if (mongoose.isValidObjectId(studentId)) {
      studentDoc = await Student.findById(studentId);
    } else {
      studentDoc = await Student.findOne({ studentId });
    }

    const orClauses: any[] = [
      { targetType: "all_students" },
      { targetType: "block_students", targetBlock: block },
    ];
    if (studentDoc) {
      orClauses.push({ targetType: "individual", targetId: studentDoc._id });
    }

    const notifications = await Notification.find({ $or: orClauses }).sort({ createdAt: -1 });

    const formattedNotifications = notifications.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      targetType: n.targetType,
      targetBlock: n.targetBlock,
      targetId: n.targetId?.toString(),
      sentBy: n.sentBy.toString(),
      sentByName: n.sentByName,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));

    successResponse(res, formattedNotifications);
  } catch (error) {
    console.error("Get notifications for student error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getNotificationsForWarden = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const block = req.userBlock || req.params.block;

    const notifications = await Notification.find({
      $or: [
        { targetType: "all_wardens" },
        { targetType: "block_warden", targetBlock: block },
      ],
    }).sort({ createdAt: -1 });

    const formattedNotifications = notifications.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      targetType: n.targetType,
      targetBlock: n.targetBlock,
      targetId: n.targetId?.toString(),
      sentBy: n.sentBy.toString(),
      sentByName: n.sentByName,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));

    successResponse(res, formattedNotifications);
  } catch (error) {
    console.error("Get notifications for warden error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const createNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, message, targetType, targetBlock, targetId } = req.body;

    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const notification = new Notification({
      title,
      message,
      targetType,
      targetBlock,
      targetId,
      sentBy: req.user._id,
      sentByName: req.user.name,
      read: false,
    });
    await notification.save();

    const formattedNotification = {
      id: notification._id.toString(),
      title: notification.title,
      message: notification.message,
      targetType: notification.targetType,
      targetBlock: notification.targetBlock,
      targetId: notification.targetId?.toString(),
      sentBy: notification.sentBy.toString(),
      sentByName: notification.sentByName,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
    };

    successResponse(res, formattedNotification, "Notification sent", 201);
  } catch (error) {
    console.error("Create notification error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      errorResponse(res, "Notification not found", 404);
      return;
    }

    const formattedNotification = {
      id: notification._id.toString(),
      title: notification.title,
      message: notification.message,
      targetType: notification.targetType,
      targetBlock: notification.targetBlock,
      targetId: notification.targetId?.toString(),
      sentBy: notification.sentBy.toString(),
      sentByName: notification.sentByName,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
    };

    successResponse(res, formattedNotification);
  } catch (error) {
    console.error("Mark as read error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({}, { read: true });
    successResponse(res, null, "All notifications marked as read");
  } catch (error) {
    console.error("Mark all as read error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) {
      errorResponse(res, "Notification not found", 404);
      return;
    }

    successResponse(res, null, "Notification deleted");
  } catch (error) {
    console.error("Delete notification error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, block } = req.query;

    let query: any = { read: false };

    if (req.user?.role === "student" && block) {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        query.$or = [
          { targetType: "all_students" },
          { targetType: "block_students", targetBlock: block },
          { targetType: "individual", targetId: student._id },
        ];
      }
    } else if (req.user?.role === "warden" && block) {
      query.$or = [
        { targetType: "all_wardens" },
        { targetType: "block_warden", targetBlock: block },
      ];
    }

    const count = await Notification.countDocuments(query);
    successResponse(res, count);
  } catch (error) {
    console.error("Get unread count error:", error);
    errorResponse(res, "Server error", 500);
  }
};
