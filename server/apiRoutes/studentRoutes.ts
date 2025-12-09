import { Router } from "express";
import {
  getAllStudents,
  getStudentById,
  getStudentsByBlock,
  createStudent,
  updateStudent,
  deleteStudent,
  allocateRoom,
  searchByStudentId,
} from "../controllers/studentController";
import { requireAuth, requireAdmin, requireAdminOrWarden } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, requireAdminOrWarden, getAllStudents);
router.get("/search/:studentId", requireAuth, searchByStudentId);
router.get("/block/:block", requireAuth, requireAdminOrWarden, getStudentsByBlock);
router.get("/:id", requireAuth, getStudentById);
router.post("/", requireAuth, requireAdmin, createStudent);
router.patch("/:id", requireAuth, requireAdmin, updateStudent);
router.delete("/:id", requireAuth, requireAdmin, deleteStudent);
router.post("/:studentId/allocate-room", requireAuth, requireAdmin, allocateRoom);

export default router;
