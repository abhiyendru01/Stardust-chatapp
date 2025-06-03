import webpush from 'web-push';
import User from '../models/user.model.js';

// Set VAPID details (Ensure this is correct, either use process.env or hardcode keys for testing)
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Function to send the push notification
const sendPushNotification = async (subscription, message) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(message));
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw new Error('Failed to send push notification');
  }
};

// Function to save subscription and send notification
export const subscribeToNotifications = async (req, res) => {
  try {
    const { subscription } = req.body; // Getting the subscription from request body
    const userId = req.user._id;  // Assuming you're using authentication middleware

    // Retrieve the user from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Save the push subscription to the user document
    user.pushNotificationSubscription = subscription;
    await user.save();  // Save the updated user document

    // Optional: Send a test notification to the user
    const messageContent = {
      notification: {
        title: 'You have a new message!',
        body: 'Check your inbox.',
        icon: user.profilePic || '/weave.png', // Use profile pic or fallback
        url: `/messages/${userId}`,  // Redirect to the user's messages page
      }
    };

    // Send push notification
    await sendPushNotification(subscription, messageContent);

    // Respond with success
    res.status(200).json({ message: 'Subscription saved and notification sent successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
};
