import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // Check authentication status and user data
  checkAuth: async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token found");

      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();  // Connect socket if the user is authenticated
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Handle signup process
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();  // Connect socket after signup
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Handle login process
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      // Store the token in localStorage for subsequent requests
      localStorage.setItem("authToken", res.data.token);

      get().connectSocket();  // Connect socket after login
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Handle logout process
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem("authToken"); // ✅ Clear token
      set({ authUser: null });
      get().disconnectSocket();  // Disconnect socket
      toast.success("Logged out successfully");

      window.location.href = "/login"; // ✅ Force reload and redirect to login
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },


  // Handle profile update
  updateProfile: async (data) => {
  set({ isUpdatingProfile: true });
  try {
    const res = await axiosInstance.put("/auth/update-profile", data);
    set({ authUser: res.data });
    toast.success("Profile updated successfully");
  } catch (error) {
    console.log("Error in update profile:", error);

    // Check if error.response exists before accessing data.message
    if (error.response && error.response.data) {
      toast.error(error.response.data.message);
    } else {
      toast.error("An unexpected error occurred");
    }
  } finally {
    set({ isUpdatingProfile: false });
  }
},


  // Socket.io connection to handle real-time features
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    // Listen for online users
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // Listen for incoming messages and show notifications
    socket.on("messageReceived", (data) => {
      const { senderId, message } = data;
    
      // Show a notification or toast for a new message
      toast.success(`New message from user ${senderId}: ${message}`, {
        duration: 5000,  // Duration for the toast notification
      });
    
      // Optionally, display other types of notifications (e.g., in-app, UI updates)
      // You could update the UI here with the new message, etc.
    });
  },

  // Disconnect the socket when the user logs out or disconnects
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
