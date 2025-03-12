import { io } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore"; // Import auth store

const backendUrl = import.meta.env.VITE_BACKEND_URL || "localhost:5001";

const authUser = useAuthStore.getState().authUser; // Get the logged-in user

const socket = io(backendUrl, {
  withCredentials: true,
  transports: ["websocket"], // ✅ Force WebSocket only, no polling
  secure: true,
  query: { userId: authUser?._id }, // ✅ Pass userId in connection query
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
