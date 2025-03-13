import { io } from "socket.io-client";
import { useAuthStore } from "./store/useAuthStore";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

let socket = null;

// ✅ Correctly export `getSocket()`
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
  }
  return socket;
};

// ✅ Optional: Export `disconnectSocket` for cleanup
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
