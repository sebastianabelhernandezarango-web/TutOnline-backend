import { Router } from "express";
import { createReservationWithPayment } from "../controllers/reservationControllers";

const router = Router();

// Crear reserva y pagar en un solo paso
router.post("/", createReservationWithPayment);

export default router;

