import { io } from "socket.io-client";
import { useAuthStore } from "./store/useAuthStore";

const backendUrl = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const authUser = useAuthStore.getState().authUser;

    if (!authUser) {
      console.warn("⚠️ No authenticated user found, delaying socket connection.");
      return null;
    }

    socket = io(backendUrl, {
      withCredentials: true,
      transports: ["websocket"],
      secure: backendUrl.startsWith("https"),
      path: "/socket.io/",
      query: { userId: authUser?._id },
      reconnection: true,         // 🔥 Ensures it reconnects
      reconnectionAttempts: 10,   // 🔥 Try 10 times
      reconnectionDelay: 2000,    // 🔥 2-second delay before retrying
    });

    socket.on("connect", () => {
      console.log(`✅ Connected to WebSocket server at ${backendUrl}`);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Disconnected from WebSocket server:", reason);
      setTimeout(() => {
        if (!socket.connected) {
          socket.connect();
        }
      }, 5000);
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ Socket connection error:", error.message);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
