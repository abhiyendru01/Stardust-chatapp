import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js"; // Ensure proper socket import

dotenv.config();

const PORT = process.env.PORT || 5001; // Default to 5001 if PORT is not defined
const __dirname = path.resolve();

const allowedOrigins = [
  "http://localhost:5173", 
  "https://fullstack-chat-4vla6v6q8-abhiyendru01s-projects.vercel.app",
];

// CORS configuration for both development and production
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies to be sent with requests
  })
);

app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);


if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.redirect("https://fullstack-chat-4vla6v6q8-abhiyendru01s-projects.vercel.app");
  });
}
// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
  connectDB(); 
});
