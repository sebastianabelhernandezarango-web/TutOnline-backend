import { Router } from "express";
import { fakePayment } from "../controllers/paymentControllers";

const router = Router();

router.post("/simulate", fakePayment);

export default router;
