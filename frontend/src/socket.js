import { io } from "socket.io-client";
import { useAuthStore } from "./store/useAuthStore";

let socket = null;

// ✅ Use relative URL (No need for VITE_BACKEND_URL)
export const getSocket = () => {
  if (!socket) {
    const authUser = useAuthStore.getState().authUser;

    if (!authUser) {
      console.warn("⚠️ No authenticated user found, delaying socket connection.");
      return null;
    }

    // ✅ Connect using relative path (frontend & backend are on the same domain)
    socket = io("/", {
      transports: ["websocket", "polling"], 
      withCredentials: true,
      path: "/socket.io/",
      query: { userId: authUser?._id },
      reconnection: true,         // 🔄 Ensures it reconnects
      reconnectionAttempts: 10,   // 🔄 Try 10 times before stopping
      reconnectionDelay: 2000,    // 🔄 2-second delay before retrying
    });

    // ✅ WebSocket Event Listeners
    socket.on("connect", () => {
      console.log(`✅ Connected to WebSocket`);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Disconnected from WebSocket:", reason);
      setTimeout(() => {
        if (!socket.connected) {
          socket.connect();
        }
      }, 5000);
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ WebSocket connection error:", error.message);
    });
  }
  return socket;
};

// ✅ Disconnect function (optional)
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
