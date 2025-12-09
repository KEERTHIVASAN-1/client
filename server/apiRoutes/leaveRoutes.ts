import { Router } from "express";
import {
  getAllLeaves,
  getLeavesByStudent,
  createLeave,
  updateLeaveStatus,
  getPendingByBlock,
  deleteLeave,
} from "../controllers/leaveController";
import { requireAuth, requireAdminOrWarden } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, requireAdminOrWarden, getAllLeaves);
router.get("/pending/:block", requireAuth, requireAdminOrWarden, getPendingByBlock);
router.get("/student/:studentId", requireAuth, getLeavesByStudent);
router.post("/student/:studentId", requireAuth, createLeave);
router.patch("/:id", requireAuth, requireAdminOrWarden, updateLeaveStatus);
router.delete("/:id", requireAuth, requireAdminOrWarden, deleteLeave);

export default router;
