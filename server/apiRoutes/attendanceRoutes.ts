import { Router } from "express";
import {
  getAttendanceByDate,
  getAttendanceByStudent,
  getStudentsForAttendance,
  markBulkAttendance,
  getAttendanceStats,
} from "../controllers/attendanceController";
import { requireAuth, requireAdminOrWarden } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, getAttendanceByDate);
router.get("/students", requireAuth, requireAdminOrWarden, getStudentsForAttendance);
router.get("/stats", requireAuth, getAttendanceStats);
router.get("/student/:studentId", requireAuth, getAttendanceByStudent);
router.post("/bulk", requireAuth, requireAdminOrWarden, markBulkAttendance);

export default router;
