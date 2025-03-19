import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"  // Use full URL in development
    : "/api"; // ✅ Direct API calls to the backend (no need for full URL)

export const axiosInstance = axios.create({
  baseURL: API_URL, 
  withCredentials: true, // Keep if using cookies/sessions
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Debugging: Log all requests
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("📡 Making API request to:", config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);
