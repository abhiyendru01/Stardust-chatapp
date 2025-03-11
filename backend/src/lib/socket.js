import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js"; // Assuming you have this model file
import { sendPushNotification } from "./firebaseAdmin.js"; // Function to send push notifications

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
    credentials: true, // Allows cookies and authentication headers
  },
});

let userSocketMap = {}; // Store userId to socketId mapping

// Function to retrieve the receiver's FCM token from the database
async function getReceiverFCMToken(receiverId) {
  try {
    const user = await User.findById(receiverId);
    if (!user) {
      console.error(`❌ User ${receiverId} not found in database.`);
      return null;
    }

    if (!user.fcmToken) {
      console.warn(`⚠️ User ${receiverId} does not have an FCM token.`);
      return null;
    }

    console.log(`✅ Retrieved FCM token for ${receiverId}: ${user.fcmToken}`);
    return user.fcmToken;
  } catch (error) {
    console.error("❌ Error retrieving FCM token:", error);
    return null;
  }
}

// Function to get receiver's socket ID
export function getReceiverSocketId(receiverId) {
  return userSocketMap[receiverId] || null;
}



io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} is now online.`);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  // Handle outgoing call
  socket.on("call", ({ senderId, receiverId, senderInfo }) => {
    console.log(`📞 ${senderId} is calling ${receiverId}`);

    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", { senderId, senderInfo });
      console.log(`📲 Ringing on ${receiverId}'s device`);
    }
  });

  // Handle call accepted
  socket.on("acceptCall", ({ senderId, receiverId }) => {
    console.log(`✅ Call accepted by ${receiverId}`);
    const senderSocketId = userSocketMap[senderId];

    if (senderSocketId) {
      io.to(senderSocketId).emit("callAccepted", { receiverId });
    }
  });

  // Handle call rejection
  socket.on("rejectCall", ({ senderId, receiverId }) => {
    console.log(`❌ Call rejected by ${receiverId}`);
    const senderSocketId = userSocketMap[senderId];

    if (senderSocketId) {
      io.to(senderSocketId).emit("callRejected");
    }
  });

  if (userId) {
    userSocketMap[userId] = socket.id; // Store userId with socket id
    console.log(`User ${userId} is now online.`);
  } else {
    console.error("No userId provided in the socket handshake.");
    socket.disconnect(); // Disconnect if no userId is provided
    return;
  }

  // Emit updated online users list to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle typing events
  socket.on("typing", (receiverId) => {
    // Emit to the other user (receiver)
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", userId);
    }
  });

  // Handle stop typing events
  socket.on("stopTyping", (receiverId) => {
    // Emit to the other user (receiver)
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", userId);
    }
  });

  // Handle sending messages
  socket.on("sendMessage", async ({ receiverId, message }) => {
    const senderId = userId;

    if (!receiverId || !senderId) {
      console.error("sendMessage: Missing senderId or receiverId.");
      return;
    }

    console.log(`📩 Message from ${senderId} to ${receiverId}: ${message}`);

    // Find the receiver's socketId
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      console.log(`✅ User ${receiverId} is online, sending message.`);
      // Emit the new message to the receiver
      io.to(receiverSocketId).emit("newMessage", { senderId, message });
    } else {
      console.log(`⚠️ User ${receiverId} is offline, sending push notification.`);

      // Retrieve receiver's FCM token
      const receiverFCMToken = await getReceiverFCMToken(receiverId);
      if (receiverFCMToken) {
        await sendPushNotification(receiverFCMToken, message);
      } else {
        console.warn(`🚨 User ${receiverId} does not have an FCM token.`);
      }
    }

    // Emit the new message to the sender as well
    const senderSocketId = userSocketMap[senderId];
    if (senderSocketId) {
      console.log(`✅ User ${senderId} is online, sending message back to sender.`);
      io.to(senderSocketId).emit("newMessage", { senderId, message });
    }
  });

  // Handle user disconnection
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