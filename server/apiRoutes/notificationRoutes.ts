import { Router } from "express";
import {
  getAllNotifications,
  getNotificationsForStudent,
  getNotificationsForWarden,
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
} from "../controllers/notificationController";
import { requireAuth, requireAdminOrWarden, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, getAllNotifications);
router.get("/unread-count", requireAuth, getUnreadCount);
router.get("/student/:studentId/:block", requireAuth, getNotificationsForStudent);
router.get("/warden/:block", requireAuth, getNotificationsForWarden);
router.post("/", requireAuth, requireAdminOrWarden, createNotification);
router.patch("/:id/read", requireAuth, markAsRead);
router.patch("/read-all", requireAuth, markAllAsRead);
router.delete("/:id", requireAuth, requireAdmin, deleteNotification);

export default router;
