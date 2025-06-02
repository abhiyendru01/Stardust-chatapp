import express from 'express';
import { User } from '../models/User.js';

const router = express.Router();

// Endpoint to store user subscription for push notifications
router.post('/subscribe', async (req, res) => {
  const { subscription } = req.body;

  try {
    // Assuming you have a user model and you associate the subscription with the user
    const user = await User.findById(req.user._id);  // Make sure to authenticate the user
    user.pushNotificationSubscription = subscription;  // Save subscription in user record
    await user.save();

    res.status(200).send('Subscription saved successfully');
  } catch (error) {
    res.status(500).send('Error saving subscription');
  }
});

// In your backend route (e.g., /api/subscribe)
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
  
export default router;
