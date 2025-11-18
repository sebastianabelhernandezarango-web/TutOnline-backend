import { Router } from "express";
import { getSuggestedTutors, followTutor } from "../controllers/tutorsExtrasControllers";

const router = Router();

router.get("/suggested", getSuggestedTutors); // ?limit=5
router.post("/follow", followTutor); // { user_id, tutor_id }

export default router;
