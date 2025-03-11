import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";  
const socket = io(backendUrl, {
  withCredentials: true,
  transports: ["websocket", "polling"],  
  secure: backendUrl.startsWith("https"),  
});


socket.on("connect", () => {
  console.log(`✅ Connected to Socket.IO server at ${backendUrl}`);
});

socket.on("disconnect", () => {
  console.log("🔴 Disconnected from Socket.IO server");
});

socket.on("connect_error", (error) => {
  console.error("⚠️ Socket connection error:", error.message);
});

export default socket;
