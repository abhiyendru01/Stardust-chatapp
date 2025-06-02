import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import helmet from "helmet";
import compression from "compression";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import friendRoutes from "./routes/friend.route.js";
import callRoutes from "./routes/call.route.js";
import notificationRoutes from './routes/notification.route'; 
import pushNotificationsRoutes from "./routes/pushNotifications.route.js";
import { app, server } from "./lib/socket.js";  

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(compression());

// ✅ Manually Handle CORS Without `cors` Package (For iOS Safari)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

// ✅ Health check route
app.get("/keep-alive", (req, res) => res.send("✅ Server is alive"));

// ✅ Helmet for security (Enhanced Content Security Policy)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://res.cloudinary.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],  // ✅ Allow images
        connectSrc: [
          "'self'",
          "https://res.cloudinary.com",
          "https://stardust-chatapp-09.onrender.com",
          "blob:",
          "ws://stardust-chatapp-09.onrender.com",
          "wss://stardust-chatapp-09.onrender.com",
        ], // ✅ Allow fetch requests & WebSockets
        mediaSrc: ["'self'", "https://res.cloudinary.com", "blob:"], // ✅ Allow media (audio, video)
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
app.use('/api/notifications', notificationRoutes);
app.use("/api/push", pushNotificationsRoutes);
app.use("/api/calls", callRoutes);

// ✅ Serve Frontend in Production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// ✅ Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on PORT: ${PORT}`);
  connectDB();
});
