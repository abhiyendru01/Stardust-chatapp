// routes/auth.route.js

import express from "express";
import { checkAuth, login, logout, signup, updateProfile, } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { storeFCMToken } from "../controllers/auth.controller.js";
import { getFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest , searchUsers} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/store-fcm-token", storeFCMToken);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

router.get("/friends", protectRoute, getFriends);
router.post("/search-users", protectRoute, searchUsers);  // New endpoint for searching users
router.post("/send-request", protectRoute, sendFriendRequest);
router.post("/accept-request", protectRoute, acceptFriendRequest);
router.post("/reject-request", protectRoute, rejectFriendRequest);




export default router;
