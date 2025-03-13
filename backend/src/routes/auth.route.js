// routes/auth.route.js

import express from "express";
import { checkAuth, login, logout, signup, updateProfile, } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { storeFCMToken } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/store-fcm-token", storeFCMToken);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);



export default router;
