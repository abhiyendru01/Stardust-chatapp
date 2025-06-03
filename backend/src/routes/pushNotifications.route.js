import express from "express";
import { subscribeToNotifications } from "../controllers/notification-controller.js"; // Import the controller function

const router = express.Router();

// POST request to save push notification subscription
router.post("/", subscribeToNotifications);

export default router;
