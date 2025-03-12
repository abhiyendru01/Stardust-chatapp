import { io } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const authUser = useAuthStore.getState().authUser;

const socket = io(backendUrl, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  secure: backendUrl.startsWith("https"),
  path: "/socket.io/", 
  query: { userId: authUser?._id }, 
});

socket.on("connect", () => {
  console.log(`✅ Connected to WebSocket server at ${backendUrl}`);
});

socket.on("disconnect", () => {
  console.log("🔴 Disconnected from WebSocket server");
});

socket.on("connect_error", (error) => {
  console.error("⚠️ Socket connection error:", error.message);
});

export default socket;
