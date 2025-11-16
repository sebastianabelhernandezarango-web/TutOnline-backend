import { Router } from "express";
import { register, login } from "../controllers/authControllers";

const router = Router();

// POST /tutonline/auth/register
router.post("/register", register);

// POST /tutonline/auth/login
router.post("/login", login);

export default router;
