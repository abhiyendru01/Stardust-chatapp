import Friend from '../models/friend.model.js';
import User from '../models/user.model.js';

export const sendFriendRequest = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

  if (senderId === receiverId) {
    return res.status(400).json({ message: "You can't send a request to yourself" });
  }

  try {
    const existingRequest = await Friend.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent or received' });
    }

    const newRequest = new Friend({
      sender: senderId,
      receiver: receiverId,
    });

    await newRequest.save();

    res.status(200).json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending friend request' });
  }
};

export const getReceivedRequests = async (req, res) => {
  const userId = req.user._id;

  try {
    const requests = await Friend.find({ receiver: userId, status: 'pending' })
      .populate('sender', 'fullName profilePic email')
      .exec();

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friend requests' });
  }
};

export const acceptFriendRequest = async (req, res) => {
  const { senderId } = req.body;
  const receiverId = req.user._id;

  try {
    const request = await Friend.findOneAndUpdate(
      { sender: senderId, receiver: receiverId, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );

    if (!request) {
      return res.status(400).json({ message: 'Friend request not found' });
    }

    // Add the sender to the receiver's friend list and vice versa
    const user = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    user.friends.push(senderId);
    sender.friends.push(receiverId);

    await user.save();
    await sender.save();

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting friend request' });
  }
};

export const rejectFriendRequest = async (req, res) => {
  const { senderId } = req.body;
  const receiverId = req.user._id;

  try {
    const request = await Friend.findOneAndUpdate(
      { sender: senderId, receiver: receiverId, status: 'pending' },
      { status: 'rejected' },
      { new: true }
    );

    if (!request) {
      return res.status(400).json({ message: 'Friend request not found' });
    }

    res.status(200).json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting friend request' });
  }
};

/** 
 * @desc Search for users by name
 * @route GET /api/friends/search
 * @access Private
 */
export const searchUsers = async (req, res) => {
  const { query } = req.body;

  try {
    // Search for users by full name or email
    const users = await User.find({
      $and: [
        { fullName: { $regex: query, $options: "i" } }, // Case-insensitive search
        { _id: { $ne: req.user._id } }, // Exclude logged-in user
      ]
    }).select('fullName email profilePic');  // Adjust fields as per your needs

    res.status(200).json(users);  // Send the users as a response
  } catch (error) {
    res.status(500).json({ message: "Error searching for users" });
  }
};
