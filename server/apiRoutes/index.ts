import { Router } from "express";
import authRoutes from "./authRoutes";
import studentRoutes from "./studentRoutes";
import wardenRoutes from "./wardenRoutes";
import roomRoutes from "./roomRoutes";
import attendanceRoutes from "./attendanceRoutes";
import feeRoutes from "./feeRoutes";
import leaveRoutes from "./leaveRoutes";
import visitorRoutes from "./visitorRoutes";
import complaintRoutes from "./complaintRoutes";
import notificationRoutes from "./notificationRoutes";
import messRoutes from "./messRoutes";
import dashboardRoutes from "./dashboardRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/students", studentRoutes);
router.use("/wardens", wardenRoutes);
router.use("/rooms", roomRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/fees", feeRoutes);
router.use("/leaves", leaveRoutes);
router.use("/visitors", visitorRoutes);
router.use("/complaints", complaintRoutes);
router.use("/notifications", notificationRoutes);
router.use("/mess", messRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
