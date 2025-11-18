import { Router } from "express";
import { getChatsByStudent} from "../controllers/chatController";

const router = Router();

router.get("/student/:studentId", getChatsByStudent);


export default router;
