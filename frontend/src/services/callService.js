import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001/api/calls";

/** ✅ Fetch Recent Calls */
export const fetchRecentCalls = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`, { withCredentials: true });
    return response.data.calls;
  } catch (error) {
    console.error("Error fetching recent calls:", error);
    return [];
  }
};

/** ✅ Save Call Log */
export const saveCallLog = async (callData) => {
  try {
    await axios.post(`${API_URL}/log`, callData, { withCredentials: true });
  } catch (error) {
    console.error("Error saving call log:", error);
  }
};
