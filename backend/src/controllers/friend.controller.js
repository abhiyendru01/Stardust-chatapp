import User from "../models/user.model.js";

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  const senderId = req.user._id;
  const { receiverId } = req.body;

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    if (receiver.friends.includes(senderId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    if (receiver.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    receiver.friendRequests.push(senderId);
    await receiver.save();

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending friend request" });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const userId = req.user._id; // current authenticated user

    // Find the sender and the user
    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!user || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add sender to the user's friends list and vice versa
    if (!user.friends.includes(senderId)) {
      user.friends.push(senderId);
    }

    if (!sender.friends.includes(userId)) {
      sender.friends.push(userId);
    }

    // Remove the sender from the friend requests list
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
    sender.friendRequests = sender.friendRequests.filter(id => id.toString() !== userId);

    await user.save();
    await sender.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error accepting friend request:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Reject a friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const userId = req.user._id;

    // Remove from friend requests
    await User.findByIdAndUpdate(userId, { $pull: { friendRequests: senderId } });
    await User.findByIdAndUpdate(senderId, { $pull: { friendRequests: userId } });

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting friend request" });
  }
};

// Get received friend requests (This is what you're likely missing)
export const getFriendRequests = async (req, res) => {
  const receiverId = req.user._id;

  try {
    const receiver = await User.findById(receiverId).populate("friendRequests", "fullName profilePic");

    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(receiver.friendRequests); // Send list of friend requests
  } catch (error) {
    res.status(500).json({ message: "Error fetching friend requests" });
  }
};

// Function for getting the friend list (added here)
export const getFriendList = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate("friends", "fullName profilePic");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.friends);
  } catch (error) {
    res.status(500).json({ message: "Error fetching friend list" });
  }
};
export const getReceivedRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await User.find({ 
      "_id": { $in: req.user.friendRequests } 
    }); // Adjust this as per your DB schema
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching friend requests" });
  }
};

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