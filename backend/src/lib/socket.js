import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js"; // User model for FCM token lookup
import { sendPushNotification } from "./firebaseAdmin.js"; // Push notification sender

const app = express();
const server = http.createServer(app);

// Initialize Socket.io server with CORS settings
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // Development frontend
      "https://chatapp003.vercel.app", // Production frontend
      "https://fullstack-chat-app-master-j115.onrender.com", // Render backend
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], 
  allowEIO3: true,
});

let userSocketMap = {}; // Store userId to socketId mapping

// ✅ Function to retrieve receiver's FCM token from DB
async function getReceiverFCMToken(receiverId) {
  try {
    const user = await User.findById(receiverId);
    if (!user || !user.fcmToken) {
      console.warn(`⚠️ No FCM token found for User ${receiverId}`);
      return null;
    }
    return user.fcmToken;
  } catch (error) {
    console.error("❌ Error retrieving FCM token:", error);
    return null;
  }
}

// ✅ Function to get receiver's socket ID
export function getReceiverSocketId(receiverId) {
  return userSocketMap[receiverId] || null;
}

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  
  if (!userId) {
    console.error("❌ No userId provided, disconnecting socket.");
    socket.disconnect(); // Stop processing if userId is missing
    return;
  }

  userSocketMap[userId] = socket.id; // Store userId with socket id
  console.log(`🟢 User ${userId} is online.`);
  io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit updated online users list

  // 📞 Handle Incoming Calls
  socket.on("call", ({ receiverId, callerId, callerName, callerProfile }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      console.log(`📞 Sending call from ${callerId} to ${receiverId}`);
      io.to(receiverSocketId).emit("incomingCall", { callerId, callerName, callerProfile });
    } else {
      console.warn(`❌ User ${receiverId} is not online.`);
    }
  });

  // 📲 Handle Call Responses
  socket.on("callAccepted", ({ callerId }) => {
    const callerSocketId = getReceiverSocketId(callerId);
    if (callerSocketId) io.to(callerSocketId).emit("callAccepted");
  });

  socket.on("callRejected", ({ callerId }) => {
    const callerSocketId = getReceiverSocketId(callerId);
    if (callerSocketId) io.to(callerSocketId).emit("callRejected");
  });
  socket.on("call", async ({ receiverId, callerId, callerName, callerProfile }) => {
    const receiverSocketId = userSocketMap[receiverId];
  
    if (receiverSocketId) {
      console.log(`📞 Sending call from ${callerId} to ${receiverId}`);
      io.to(receiverSocketId).emit("incomingCall", { callerId, callerName, callerProfile });
    } else {
      console.warn(`❌ User ${receiverId} is not online.`);
  
      // ✅ Send Push Notification as a fallback
      const receiverFCMToken = await getReceiverFCMToken(receiverId);
      if (receiverFCMToken) {
        await sendPushNotification(receiverFCMToken, `${callerName} is calling you!`);
      } else {
        console.warn(`🚨 No FCM token available for User ${receiverId}.`);
      }
    }
  });
  
  // ⌨️ Handle Typing Events
  socket.on("typing", (receiverId) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit("typing", userId);
  });

  socket.on("stopTyping", (receiverId) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit("stopTyping", userId);
  });

  // ✉️ Handle Sending Messages
  socket.on("sendMessage", async ({ receiverId, message }) => {
    if (!receiverId || !userId) {
      console.error("❌ sendMessage: Missing senderId or receiverId.");
      return;
    }

    console.log(`📩 Message from ${userId} to ${receiverId}: ${message}`);

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      console.log(`✅ User ${receiverId} is online, sending message.`);
      io.to(receiverSocketId).emit("newMessage", { senderId: userId, message });
    } else {
      console.warn(`⚠️ User ${receiverId} is offline, sending push notification.`);

      // Retrieve receiver's FCM token
      const receiverFCMToken = await getReceiverFCMToken(receiverId);
      if (receiverFCMToken) {
        await sendPushNotification(receiverFCMToken, message);
      } else {
        console.warn(`🚨 No FCM token available for User ${receiverId}.`);
      }
    }

    // Emit the new message back to the sender
    const senderSocketId = getReceiverSocketId(userId);
    if (senderSocketId) io.to(senderSocketId).emit("newMessage", { senderId: userId, message });
  });

  // ❌ Handle User Disconnection
  socket.on("disconnect", () => {
    if (userId) {
      console.log(`🔴 User ${userId} disconnected.`);
      delete userSocketMap[userId]; // Remove from online users
      io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit updated online users list
    }
  });
});

// Export the app, server, and io
export { app, server, io };
