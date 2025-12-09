import { Router } from "express";
import {
  getAllComplaints,
  getComplaintById,
  getComplaintsByStudent,
  createComplaint,
  updateComplaintStatus,
  getComplaintStats,
  deleteComplaint,
} from "../controllers/complaintController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, requireAdmin, getAllComplaints);
router.get("/stats", requireAuth, requireAdmin, getComplaintStats);
router.get("/student/:studentId", requireAuth, getComplaintsByStudent);
router.get("/:id", requireAuth, getComplaintById);
router.post("/student/:studentId", requireAuth, createComplaint);
router.patch("/:id", requireAuth, requireAdmin, updateComplaintStatus);
router.delete("/:id", requireAuth, requireAdmin, deleteComplaint);

export default router;
