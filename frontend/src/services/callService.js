import axios from "axios";
import toast from "react-hot-toast";

export const saveCallLog = async ({ caller, receiver, callType, status, duration }) => {
  try {
    const token = localStorage.getItem("authToken"); // ✅ Get token from storage
    if (!token) throw new Error("No token found. Please log in again.");

    const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/calls/log`, 
      { caller, receiver, callType, status, duration }, 
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Include token in headers
        },
      }
    );

    console.log("📞 Call log saved:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error saving call log:", error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Failed to save call log.");
  }
};

export const fetchRecentCalls = async (userId) => {
  try {
    const token = localStorage.getItem("authToken");  // ✅ Get token from storage
    if (!token) throw new Error("No token found. Please log in again.");

    console.log("Fetching recent calls for:", userId);  // ✅ Debugging Log

    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/calls/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,  // ✅ Include token in headers
      },
    });

    console.log("API Response:", res.data);  // ✅ Log response

    if (!res.data || !res.data.calls) {
      console.warn("⚠️ No calls returned from API.");
      return [];
    }

    return res.data.calls;
  } catch (error) {
    console.error("❌ Error fetching recent calls:", error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Failed to fetch recent calls.");
    return [];
  }
};