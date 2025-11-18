import { Router } from "express";
import { getTutorPosts, createPost } from "../controllers/postController";

const router = Router();

router.get("/:tutorId", getTutorPosts);
router.post("/", createPost); // Auth required

export default router;
