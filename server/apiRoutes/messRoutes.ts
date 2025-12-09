import { Router } from "express";
import {
  getAllMenuItems,
  getWeeklyMenu,
  getMenuByDay,
  getTodayMenu,
  updateMenuItem,
  updateWeeklyMenu,
} from "../controllers/messController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, getAllMenuItems);
router.get("/weekly", requireAuth, getWeeklyMenu);
router.get("/today", requireAuth, getTodayMenu);
router.get("/day/:day", requireAuth, getMenuByDay);
router.put("/", requireAuth, requireAdmin, updateMenuItem);
router.put("/weekly", requireAuth, requireAdmin, updateWeeklyMenu);

export default router;
