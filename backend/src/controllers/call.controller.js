import Call from "../models/call.model.js";
import pkg from "agora-access-token";

/** ✅ Generate Agora Token */
const { RtcTokenBuilder, RtcRole } = pkg;
export const generateAgoraToken = async (req, res) => {
  try {
    const { channelName, uid } = req.body;

    if (!channelName || !uid) {
      return res.status(400).json({ success: false, message: "Missing channel name or UID" });
    }
    
    
    const AGORA_APP_ID = process.env.AGORA_APP_ID;
    const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
    const expirationTimeInSeconds = 3600; // 1 hour token validity
    const role = RtcRole.PUBLISHER;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid,
      role,
      expirationTimestamp
    );

    res.status(200).json({
      success: true,
      token,
      channelName,
      uid,
    });
  } catch (error) {
    console.error("Error generating Agora token:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/** ✅ Save Call Log */
export const saveCallLog = async (req, res) => {
  try {
    const { caller, receiver, callType, status, duration } = req.body;

    const call = new Call({
      caller,
      receiver,
      callType,
      status,
      duration,
    });

    await call.save();
    res.status(201).json({ success: true, message: "Call logged successfully", call });
  } catch (error) {
    console.error("Error saving call log:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/** ✅ Get Recent Calls */
export const getRecentCalls = async (req, res) => {
  try {
    const { userId } = req.params;

    const calls = await Call.find({
      $or: [{ caller: userId }, { receiver: userId }],
    })
      .populate("caller", "fullName profilePic")
      .populate("receiver", "fullName profilePic")
      .sort({ timestamp: -1 })
      .limit(20);

    res.status(200).json({ success: true, calls });
  } catch (error) {
    console.error("Error fetching recent calls:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
