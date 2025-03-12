import axios from "axios";
import { API_CONFIG } from "./constants";

// Create and configure axios instance
export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" 
    ? API_CONFIG.DEVELOPMENT_URL 
    : API_CONFIG.PRODUCTION_URL,
  withCredentials: false,  // No need for credentials since we're using localStorage
  headers: {
    "Content-Type": "application/json",  // Default for JSON requests
  },
});



// Add an interceptor to automatically add the token to headers
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  // Check if the request is a FormData (for file uploads)
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data"; // Set content-type for file uploads
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});
