import { Router } from "express";
import {
  getAllFees,
  getFeeByStudentId,
  createFee,
  recordPayment,
  updateFeeStatus,
  getFeeStats,
  updateFee,
  deleteFee,
} from "../controllers/feeController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, getAllFees);
router.get("/stats", requireAuth, requireAdmin, getFeeStats);
router.get("/student/:studentId", requireAuth, getFeeByStudentId);
router.post("/", requireAuth, requireAdmin, createFee);
router.patch("/:id/payment", requireAuth, requireAdmin, recordPayment);
router.patch("/:id/status", requireAuth, requireAdmin, updateFeeStatus);
router.patch("/:id", requireAuth, requireAdmin, updateFee);
router.delete("/:id", requireAuth, requireAdmin, deleteFee);

export default router;
