// routes/tutors.ts
import { Router } from "express";
import { getAllTutors, getTutorById, searchTutors } from "../controllers/tutorsController";

const router = Router();
router.get("/", getAllTutors);
router.get("/filter", searchTutors); // ejemplo: ?especialidad=Matematicas&ubicacion=Bogota
router.get("/:id", getTutorById);
export default router;