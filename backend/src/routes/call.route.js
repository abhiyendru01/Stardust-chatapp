import express from "express";
import { getRecentCalls, saveCallLog } from "../controllers/call.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/log", protectRoute, saveCallLog); // Save a call log
router.get("/:userId", protectRoute, getRecentCalls); // Fetch recent calls

export default router;
