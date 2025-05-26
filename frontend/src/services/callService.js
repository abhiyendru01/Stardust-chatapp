
import { axiosInstance } from "../lib/axios";


export const API_URL = "/"; 

export const fetchAgoraToken = async (channelName, uid) => {
  try {
    const response = await fetch(`/api/calls/token`, { // ✅ Use relative path
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`, // ✅ Ensure Token is Sent
      },
      body: JSON.stringify({ channelName, uid }),
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();
    console.log("✅ Agora Token Received:", data);
    return data.token;
  } catch (error) {
    console.error("❌ Error fetching Agora token:", error);
    return null;
  }
};

export const saveCallLog = async (callData) => {
  try {
    const response = await fetch(`/api/calls/log`, { // ✅ Use relative path
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`, // ✅ Send Token
      },
      body: JSON.stringify(callData),
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();
    console.log("✅ Call log saved successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Error saving call log:", error);
    return null;
  }
};

// ✅ Fetch Recent Calls
export const fetchRecentCalls = async (userId) => {
  try {
    console.log(`🔗 Fetching recent calls for User: ${userId}`);
    
    // Debugging API URL
    const response = await axiosInstance.get(`/api/calls/${userId}`);
    
    console.log("✅ API Response (Recent Calls):", response.data); // Debugging
    return response.data.calls || [];
  } catch (error) {
    console.error("❌ Error fetching recent calls:", error);
    
    // Check if API returned anything
    if (error.response) {
      console.error("⚠️ API Error Response:", error.response.data);
    }
    
    return [];
  }
};
