import Call from "../models/call.model.js";

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
      .limit(20); // Get last 20 calls

    res.status(200).json({ success: true, calls });
  } catch (error) {
    console.error("Error fetching recent calls:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
