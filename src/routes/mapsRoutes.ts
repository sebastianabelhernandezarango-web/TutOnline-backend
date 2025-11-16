// routes/mapRoutes.ts
import { Router } from "express";
import { getNearbyTutors } from "../controllers/mapsController";

const router = Router();

// GET /tutonline/map/nearby?lat=...&lng=...&radius=5
router.get("/nearby", getNearbyTutors);

export default router;
