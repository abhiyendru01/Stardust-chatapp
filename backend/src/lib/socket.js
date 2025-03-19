import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js"; // User model for FCM token lookup
import { sendPushNotification } from "./firebaseAdmin.js"; // Push notification sender
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

// ✅ Initialize WebSocket Server (No CORS Needed)
const io = new Server(server, {
  transports: ["websocket", "polling"],
  path: "/socket.io/",
});

let userSocketMap = {}; // Store userId to socketId mapping

// ✅ Save Messages to Database
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

// ✅ Retrieve Receiver's FCM Token
async function getReceiverFCMToken(receiverId) {
  try {
    const user = await User.findById(receiverId);
    return user?.fcmToken || null;
  } catch (error) {
    console.error("❌ Error retrieving FCM token:", error);
    return null;
  }
}

// ✅ Get Receiver's Socket ID
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

  // ✅ Handle Disconnection
  socket.on("disconnect", () => {
    console.log(`🔴 User ${userId} disconnected.`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // 📞 Handle Incoming Calls
  socket.on("call", async ({ receiverId, callerId, callerName, callerProfile }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      console.log(`📞 Sending call from ${callerId} to ${receiverId}`);
      io.to(receiverSocketId).emit("incomingCall", { callerId, callerName, callerProfile });
    } else {
      console.warn(`❌ User ${receiverId} is not online.`);
      const fcmToken = await getReceiverFCMToken(receiverId);
      if (fcmToken) {
        sendPushNotification(receiverId, { senderId: callerId, senderName: callerName, senderProfile: callerProfile });
      }
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

  // ✉️ Handle Sending Messages
  socket.on("sendMessage", async ({ receiverId, message }) => {
    console.log(`📩 [SERVER] Received message from ${message.senderId} to ${receiverId}:`, message);
    if (!message.senderId || !receiverId) return console.error("❌ Missing senderId or receiverId.");

    await saveMessageToDB(message.senderId, receiverId, message);

    // ✅ Emit Message in Real-time
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    } else {
      await sendPushNotification(receiverId, message);
    }

    // ✅ Send Message Back to Sender
    const senderSocketId = userSocketMap[message.senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", message);
    }
  });
});

// ✅ Export Server & WebSocket
export { app, server, io };
