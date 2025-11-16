import { Router } from "express";
import { createVideoSession, getVideoSessionByReservation } from "../controllers/videoSessionController";

const router = Router();

// Crear sesión de videollamada
router.post("/", createVideoSession);

// Obtener sesión por reserva
router.get("/:reservationId", getVideoSessionByReservation);

export default router;