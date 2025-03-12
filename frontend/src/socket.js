import { io } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";

export const getSocket = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
  const authUser = useAuthStore.getState().authUser;

  return io(backendUrl, {
    withCredentials: true,
    transports: ["websocket"],
    secure: backendUrl.startsWith("https"),
    path: "/socket.io/",
    query: { userId: authUser?._id },
  });
};


