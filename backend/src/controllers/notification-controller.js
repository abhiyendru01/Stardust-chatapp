import webpush from 'web-push';
import { User } from '../models/User.js';

const sendPushNotification = async (subscription, message) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(message));
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

const notifyUser = async (receiverId, message) => {
  const user = await User.findById(receiverId);
  if (user && user.pushNotificationSubscription) {
    const subscription = user.pushNotificationSubscription;

    // Custom message content
    const messageContent = {
      title: 'New Message',
      body: message.text,
      url: `/messages/${message.senderId}`,
    };

    sendPushNotification(subscription, messageContent);
  }
};

export const subscribeToNotifications = async (req, res) => {
    try {
      const { subscription } = req.body;
      const userId = req.user._id;  // Assuming you have user info in req.user
  
      // Store subscription in database (make sure to use your model for the user)
      const user = await User.findById(userId);
      user.pushNotificationSubscription = subscription;
      await user.save();
  
      res.status(200).json({ message: 'Subscription saved successfully' });
    } catch (error) {
      console.error("❌ Error saving push subscription:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
export { notifyUser };
