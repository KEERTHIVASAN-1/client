import { Router } from "express";
import {
  getAdminDashboardStats,
  getWardenDashboardStats,
  getStudentDashboardStats,
  getMonthlyChartData,
} from "../controllers/dashboardController";
import { requireAuth, requireAdmin, requireAdminOrWarden } from "../middleware/auth";

const router = Router();

router.get("/admin", requireAuth, requireAdmin, getAdminDashboardStats);
router.get("/warden", requireAuth, requireAdminOrWarden, getWardenDashboardStats);
router.get("/student/:studentId", requireAuth, getStudentDashboardStats);
router.get("/monthly", requireAuth, getMonthlyChartData);

export default router;
