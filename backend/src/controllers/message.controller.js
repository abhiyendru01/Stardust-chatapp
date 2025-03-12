import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import multer from "multer";
import { getReceiverSocketId, io } from "../lib/socket.js";

const upload = multer({ storage: multer.memoryStorage() });

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // ✅ Fetch users excluding the logged-in user
    let users = await User.find({ _id: { $ne: loggedInUserId } })
      .select("fullName email profilePic lastMessagedAt")
      .sort({ lastMessagedAt: -1 })
      .lean();

    // ✅ Fetch the latest message & unread count for each user
    for (let user of users) {
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: loggedInUserId, receiverId: user._id },
          { senderId: user._id, receiverId: loggedInUserId },
        ],
      })
        .sort({ timestamp: -1 })
        .select("text timestamp senderId isRead");

      // ✅ Count unread messages from this user
      const unreadCount = await Message.countDocuments({
        senderId: user._id,
        receiverId: loggedInUserId,
        isRead: false,
      });

      user.lastMessage = lastMessage ? lastMessage.text : "";
      user.lastMessageTime = lastMessage ? lastMessage.timestamp : null;
      user.unreadCount = unreadCount; // ✅ Add unread count to the response
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const uploadAudio = async (req, res) => {
  try {
    console.log("Received request to upload audio");

    if (!req.file) {
      console.error("❌ No audio file received");
      return res.status(400).json({ error: "No audio file provided" });
    }

    console.log("✅ Audio file received:", req.file);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "audio" },
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

    return res.status(200).json({ url: result.secure_url });
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

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // ✅ Save message with `isRead: false`
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio,
      timestamp: new Date(),
      isRead: false, 
    });

    await newMessage.save();

    // ✅ Update lastMessagedAt for both users
    await User.findByIdAndUpdate(senderId, { lastMessagedAt: new Date() }, { new: true });
    await User.findByIdAndUpdate(receiverId, { lastMessagedAt: new Date() }, { new: true });

    // ✅ Emit the new message to BOTH sender & receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    if (senderSocketId) {  // ✅ Ensure sender also sees the message instantly
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
