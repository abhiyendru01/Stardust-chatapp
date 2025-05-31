import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";



export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, res); 

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      token, 
    });
  } catch (error) {
    console.error("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName } = req.body;
    const userId = req.user._id; 

    let uploadedImageUrl = null;

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        resource_type: "image",
        folder: "profile_pictures",
      });

      uploadedImageUrl = uploadResponse.secure_url;
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName: fullName || "",
        profilePic: uploadedImageUrl || undefined, 
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const storeFCMToken = async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;

  try {
    await User.findByIdAndUpdate(userId, { fcmToken: token });
    res.status(200).json({ message: "FCM token stored successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error storing FCM token" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("friends", "fullName profilePic email");
    res.status(200).json(user.friends);
  } catch (error) {
    res.status(500).json({ message: "Error fetching friends" });
  }
};

// Search for users (exclude the logged-in user)
export const searchUsers = async (req, res) => {
  const { query } = req.body; // search query (username or email)
  try {
    const users = await User.find({
      $and: [
        { fullName: { $regex: query, $options: "i" } }, // case-insensitive search
        { _id: { $ne: req.user._id } }, // exclude the logged-in user
        ]
      }).select("fullName profilePic email");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error searching for users" });
  }
};

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (sender.friendRequests.includes(receiverId)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    sender.friendRequests.push(receiverId);
    await sender.save();
    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    res.status(500).json({ message: "Error sending friend request" });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  const { senderId } = req.body;
  const receiverId = req.user._id;

  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    // Add each other as friends
    receiver.friends.push(senderId);
    sender.friends.push(receiverId);

    // Remove the friend request
    receiver.friendRequests = receiver.friendRequests.filter(
      (id) => id.toString() !== senderId
    );

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ message: "Error accepting friend request" });
  }
};

// Reject a friend request
export const rejectFriendRequest = async (req, res) => {
  const { senderId } = req.body;
  const receiverId = req.user._id;

  try {
    const receiver = await User.findById(receiverId);
    receiver.friendRequests = receiver.friendRequests.filter(
      (id) => id.toString() !== senderId
    );

    await receiver.save();
    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting friend request" });
  }
};

