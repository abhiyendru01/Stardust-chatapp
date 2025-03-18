import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import multer from "multer";
import { getReceiverSocketId, io } from "../lib/socket.js";

const upload = multer({ storage: multer.memoryStorage() });

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // ✅ Optimized MongoDB Aggregation Query
    const users = await User.aggregate([
      {
        $match: { _id: { $ne: loggedInUserId } }, // Exclude logged-in user
      },
      {
        $lookup: {
          from: "messages",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $and: [{ $eq: ["$senderId", loggedInUserId] }, { $eq: ["$receiverId", "$$userId"] }] },
                    { $and: [{ $eq: ["$senderId", "$$userId"] }, { $eq: ["$receiverId", loggedInUserId] }] },
                  ],
                },
              },
            },
            { $sort: { timestamp: -1 } },
            { $limit: 1 }, // Get only the latest message
            { $project: { text: 1, image: 1, audio: 1, timestamp: 1, senderId: 1, isRead: 1 } },
          ],
          as: "lastMessage",
        },
      },
      {
        $lookup: {
          from: "messages",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$senderId", "$$userId"] },
                    { $eq: ["$receiverId", loggedInUserId] },
                    { $eq: ["$isRead", false] }, // Count only unread messages
                  ],
                },
              },
            },
            { $count: "unreadCount" },
          ],
          as: "unreadMessages",
        },
      },
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ["$lastMessage", 0] }, // Convert array to object
          unreadCount: { $ifNull: [{ $arrayElemAt: ["$unreadMessages.unreadCount", 0] }, 0] },
        },
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          profilePic: 1,
          lastMessagedAt: 1,
          lastMessage: {
            $cond: [
              { $ifNull: ["$lastMessage.text", false] }, "$lastMessage.text",
              { $ifNull: ["$lastMessage.image", false] }, "📷 Image",
              { $ifNull: ["$lastMessage.audio", false] }, "🎵 Voice Note",
              ""
            ]
          },
          lastMessageTime: "$lastMessage.timestamp",
          unreadCount: 1,
        },
      },
      { $sort: { lastMessageTime: -1 } }, // Sort by latest message time
    ]);

    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const uploadAudio = async (req, res) => {
  try {
    console.log("📥 Received audio upload request...");

    if (!req.file) {
      console.error("❌ No audio file received");
      return res.status(400).json({ error: "No audio file provided" });
    }

    console.log("✅ Audio file received:", req.file);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "video", // ✅ Cloudinary treats audio as "video"
          folder: "audio-messages",
          format: "mp3", // ✅ Convert to MP3 for better compatibility
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary Upload Error:", error);
            reject(error);
          } else {
            console.log("✅ Cloudinary Upload Success:", result.secure_url);
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    return res.status(200).json({ url: uploadResult.secure_url });
  } catch (error) {
    console.error("❌ Unexpected Error in uploadAudio:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    if (!myId) {
      return res.status(401).json({ error: "Unauthorized. User not found." });
    }

    // ✅ Fetch messages
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ timestamp: 1 });

    // ✅ Mark messages as read
    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl = null;
    let audioUrl = null;

    // ✅ Upload image if provided
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      } catch (error) {
        console.error("❌ Image upload failed:", error);
      }
    }

    // ✅ Upload audio if provided and ensure it's a Cloudinary URL
    if (audio && audio.startsWith("data:audio")) {
      try {
        const uploadAudioResponse = await cloudinary.uploader.upload(audio, {
          resource_type: "video", // Cloudinary uses 'video' for audio files
          folder: "audio-messages",
        });
        audioUrl = uploadAudioResponse.secure_url;
        console.log("✅ Audio successfully uploaded:", audioUrl);
      } catch (error) {
        console.error("❌ Audio upload failed:", error);
        return res.status(500).json({ error: "Audio upload failed" });
      }
    } else {
      audioUrl = audio; // If it's already a URL, store it directly
    }

    // ✅ Ensure at least one valid message type is present
    if (!text && !imageUrl && !audioUrl) {
      return res.status(400).json({ error: "Message cannot be empty!" });
    }

    // ✅ Save message with correct data
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio: audioUrl, // Now always contains a proper Cloudinary URL
      timestamp: new Date(),
      isRead: false,
    });

    await newMessage.save();

    // ✅ Update lastMessagedAt for both users
    await User.findByIdAndUpdate(senderId, { lastMessagedAt: new Date() });
    await User.findByIdAndUpdate(receiverId, { lastMessagedAt: new Date() });

    // ✅ Emit the new message to BOTH sender & receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    if (senderSocketId) {  
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("❌ Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
