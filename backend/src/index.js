import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import friendRoutes from "./routes/friend.route.js";
import callRoutes from "./routes/call.route.js";
import compression from "compression";
import { app, server } from "./lib/socket.js";  
import pushNotificationsRoutes from './routes/pushNotifications.route.js';

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// ✅ Allowed Origins (Frontend & Backend URLs)
const allowedOrigins = [
  "http://localhost:5173",
  "https://stardust-chatapp-frontend.onrender.com",
  "https://stardust-chatapp-09.onrender.com",
  "http://localhost:5001",
  "ws://localhost:5001",
  "wss://stardust-chatapp-09.onrender.com"
];

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// ✅ Keep-Alive Endpoint (Prevents Render from Pausing)
app.get("/keep-alive", (req, res) => res.send("✅ Server is Alive!"));

// ✅ Improved CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS Blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["set-cookie"],
  })
);

// ✅ Helmet Security Headers (Allows WebSockets)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "localhost:5173",
          "https://stardust-chatapp-frontend.onrender.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://stardust-chatapp-frontend.onrender.com"],
        connectSrc: [
          "'self'",
          "http://localhost:5173",
          "https://stardust-chatapp-frontend.onrender.com",
          "https://stardust-chatapp-09.onrender.com",
          "ws://localhost:5001",
          "wss://stardust-chatapp-09.onrender.com"
        ],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
  })
);

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/push", pushNotificationsRoutes);
app.use("/api/calls", callRoutes);
app.use(compression());

// ✅ Serve Frontend in Production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// ✅ Keep Render Backend Active (Sends ping every 5 minutes)
setInterval(() => {
  fetch("https://stardust-chatapp-09.onrender.com/keep-alive")
    .then((res) => res.text())
    .then((text) => console.log(`🔄 Keep-Alive Ping: ${text}`))
    .catch((err) => console.error("❌ Keep-Alive Failed:", err));
}, 5 * 60 * 1000); // Every 5 minutes

// ✅ Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on PORT: ${PORT}`);
  connectDB();
});
