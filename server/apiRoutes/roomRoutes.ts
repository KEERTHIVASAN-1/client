import { Router } from "express";
import {
  getAllRooms,
  getRoomById,
  getRoomsByBlock,
  getAvailableRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  updateOccupancy,
} from "../controllers/roomController";
import { requireAuth, requireAdmin, requireAdminOrWarden } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, requireAdminOrWarden, getAllRooms);
router.get("/available", requireAuth, getAvailableRooms);
router.get("/block/:block", requireAuth, requireAdminOrWarden, getRoomsByBlock);
router.get("/:id", requireAuth, getRoomById);
router.post("/", requireAuth, requireAdmin, createRoom);
router.patch("/:id", requireAuth, requireAdmin, updateRoom);
router.patch("/:id/occupancy", requireAuth, requireAdmin, updateOccupancy);
router.delete("/:id", requireAuth, requireAdmin, deleteRoom);

export default router;
