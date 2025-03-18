import axios from "axios";
import { API_CONFIG } from "./constants";

// ✅ Fix API URL Formatting
const API_URL = import.meta.env.MODE === "development"
  ? API_CONFIG.DEVELOPMENT_URL.replace(/\/$/, "")  // Remove trailing slash
  : API_CONFIG.PRODUCTION_URL.replace(/\/$/, "");

console.log("✅ API Base URL:", API_URL); // Debugging

// ✅ Create and configure axios instance
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Set to `true` if using cookies for auth
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Add an interceptor to automatically attach auth tokens
axiosInstance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("authToken");
    
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      if (import.meta.env.MODE === "development") {
        console.log("🔑 Auth Token Attached:", token);
      }
    }

    // ✅ Handle FormData requests for file uploads
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  } catch (error) {
    console.error("❌ Error attaching token:", error);
    return Promise.reject(error);
  }
}, (error) => {
  return Promise.reject(error);
});

