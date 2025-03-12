import { io } from "socket.io-client";
import { useAuthStore } from "./store/useAuthStore";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const authUser = useAuthStore.getState().authUser;

const socket = io(backendUrl, {
  withCredentials: true,
  transports: ["websocket"], // ✅ Enforce WebSocket-only (no polling)
  secure: backendUrl.startsWith("https"),
  path: "/socket.io/", 
  query: { userId: authUser?._id }, 
  reconnection: true, // ✅ Enable auto-reconnection
  reconnectionAttempts: 10, // ✅ Retry 10 times before failing
  reconnectionDelay: 5000, // ✅ Wait 5 sec before retrying
});

socket.on("connect", () => {
  console.log(`✅ Connected to WebSocket server at ${backendUrl}`);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Disconnected from WebSocket server. Reason:", reason);
  if (reason === "io server disconnect") {
    console.log("🌀 Attempting to reconnect...");
    socket.connect(); // ✅ Force reconnection
  }
});

socket.on("connect_error", (error) => {
  console.error("⚠️ Socket connection error:", error.message);
});

export default socket;
