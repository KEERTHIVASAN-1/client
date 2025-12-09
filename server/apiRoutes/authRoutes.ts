import { Router } from "express";
import { login, logout, refreshToken, getProfile } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", requireAuth, getProfile);
router.get("/profile", requireAuth, getProfile);

export default router;
