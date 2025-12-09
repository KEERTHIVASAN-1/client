import { Router } from "express";
import {
  getAllWardens,
  getWardenById,
  getWardenByBlock,
  createWarden,
  updateWarden,
  deleteWarden,
} from "../controllers/wardenController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, getAllWardens);
router.get("/block/:block", requireAuth, getWardenByBlock);
router.get("/:id", requireAuth, getWardenById);
router.post("/", requireAuth, requireAdmin, createWarden);
router.patch("/:id", requireAuth, requireAdmin, updateWarden);
router.delete("/:id", requireAuth, requireAdmin, deleteWarden);

export default router;
