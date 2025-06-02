// src/routes/friend.route.js

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getReceivedRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendList,
  getFriendRequests,
  searchUsers,
} from "../controllers/friend.controller.js";

const router = express.Router();

router.get("/received-requests", protectRoute, getReceivedRequests);
router.post("/send-request", protectRoute, sendFriendRequest);
router.post("/accept-request", protectRoute, acceptFriendRequest);
router.post("/reject-request", protectRoute, rejectFriendRequest);
router.get("/friends", protectRoute, getFriendList);
router.get("/friend-requests", protectRoute, getFriendRequests);
router.post("/search-users", protectRoute, searchUsers);
export default router;
