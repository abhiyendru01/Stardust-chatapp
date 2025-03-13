import { Server } from "socket.io";
import admin from "firebase-admin";
import http from "http";
import express from "express";
import User from "../models/user.model.js"; // User model for FCM token lookup
import { sendPushNotification } from "./firebaseAdmin.js"; // Push notification sender
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

// Initialize Socket.io server with CORS settings
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chatapp003.vercel.app",
      "http://localhost:5001",
      "https://stardust-chatapp-production.up.railway.app"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
  allowEIO3: true,
  path: "/socket.io/",
});


let userSocketMap = {}; // Store userId to socketId mapping
async function saveMessageToDB(senderId, receiverId, message) {
  try {
      const newMessage = new Message({
          senderId,
          receiverId,
          text: message.text,
          createdAt: new Date(),
      });
      await newMessage.save();
      console.log("✅ Message saved to DB");
  } catch (error) {
      console.error("❌ Error saving message:", error);
  }
}

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
  console.log(`✅ WebSocket Connected: ${socket.id}`);

  const userId = socket.handshake.query.userId;

  if (!userId) {
    console.error("❌ No userId provided, disconnecting socket.");
    socket.disconnect();
    return;
  }


  userSocketMap[userId] = socket.id;
  console.log(`🟢 User ${userId} is online.`);
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", (reason) => {
    console.log(`🔴 User ${userId} disconnected. Reason: ${reason}`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
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
      const fcmToken = await getReceiverFCMToken(receiverId);
      if (fcmToken) {
        sendPushNotification(receiverId, { senderId: callerId, senderName: callerName, senderProfile: callerProfile });
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
    console.log(`📩 [SERVER] Received message from ${message.senderId} to ${receiverId}:`, message);

    // Ensure userId is set correctly
    const senderId = message.senderId;  
    if (!senderId || !receiverId) {
        console.error("❌ [SERVER] Missing senderId or receiverId.");
        return;
    }

    // ✅ Send message to the receiver if they are online
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
        console.log(`✅ [SERVER] Sending message to receiver: ${receiverSocketId}`);
        io.to(receiverSocketId).emit("newMessage", { senderId, message });
    } else {
        console.warn(`⚠️ [SERVER] Receiver ${receiverId} is offline. Sending push notification...`);

        // ✅ Send push notification since the user is offline
        await sendPushNotification(receiverId, message);
    }

    // ✅ Send message back to the sender so it appears instantly on their chat
    const senderSocketId = userSocketMap[senderId];
    if (senderSocketId) {
        console.log(`✅ [SERVER] Sending message back to sender: ${senderSocketId}`);
        io.to(senderSocketId).emit("newMessage", { senderId, message });
    }

    // ✅ Store message in the database (Assuming you have a function to save messages)
    try {
        await saveMessageToDB(senderId, receiverId, message);
        console.log(`📩 [SERVER] Message stored in DB: ${message.text}`);
    } catch (error) {
        console.error("❌ [SERVER] Error storing message:", error);
    }
});


});

// Export the app, server, and io
export { app, server, io };
