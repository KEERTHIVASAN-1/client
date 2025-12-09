import { Router } from "express";
import {
  getAllVisitors,
  getVisitorsByStudent,
  checkIn,
  checkOut,
  getTodayByBlock,
  deleteVisitor,
} from "../controllers/visitorController";
import { requireAuth, requireAdmin, requireAdminOrWarden } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, requireAdminOrWarden, getAllVisitors);
router.get("/today/:block", requireAuth, requireAdminOrWarden, getTodayByBlock);
router.get("/student/:studentId", requireAuth, getVisitorsByStudent);
router.post("/", requireAuth, requireAdmin, checkIn);
router.patch("/:id/checkout", requireAuth, requireAdminOrWarden, checkOut);
router.delete("/:id", requireAuth, requireAdmin, deleteVisitor);

export default router;
