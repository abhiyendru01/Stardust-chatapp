import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, uploadAudio , deleteMessage } from "../controllers/message.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/upload-audio", upload.single("audio"), uploadAudio);
router.post("/send/:id", protectRoute, sendMessage);
router.delete('/delete/:messageId', deleteMessage);


export default router;
