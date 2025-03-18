

const API_URL = import.meta.env.VITE_BACKEND_URL.startsWith("http")
  ? import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")
  : `https://${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}`;

export const fetchAgoraToken = async (channelName, uid) => {
  try {
    const response = await fetch(`${API_URL}/api/calls/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,  // ✅ Ensure Token is Sent
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
    const response = await fetch(`${API_URL}/api/calls/log`, {
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

import { axiosInstance } from "../lib/axios";

// ✅ Fetch Recent Calls
export const fetchRecentCalls = async (userId) => {
  try {
    console.log(`🔗 Fetching recent calls for User: ${userId}`);
    const response = await axiosInstance.get(`/calls/${userId}`);
    console.log("✅ API Response (Recent Calls):", response.data); // Debugging
    return response.data.calls || [];
  } catch (error) {
    console.error("❌ Error fetching recent calls:", error);
    return [];
  }
};
