// routes/dashboardRoutes.ts
import { Router } from "express";
import {getStudentDashboard, getTutorDashboard } from "../controllers/dashboardController";

const router = Router();

// Dashboard del estudiante
router.get("/student/:studentId", getStudentDashboard);

// Dashboard del tutor
router.get("/tutor/:tutorId", getTutorDashboard);

export default router;
