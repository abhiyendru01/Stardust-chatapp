import webPush from 'web-push';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Set the VAPID details using the keys from the .env file
webPush.setVapidDetails(
  'mailto:abhiyendru@gmail.com', // Optional email
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Function to send the push notification
export const sendPushNotification = (subscription, message) => {
  const payload = JSON.stringify({
    title: 'New Message!',
    body: message,
    icon: '/weave.png',  // Replace with your own icon URL if needed
    url: '/chat',  // Link to the chat page, this will open when the user clicks the notification
  });

  webPush.sendNotification(subscription, payload)
    .then((response) => {
      console.log('Notification sent:', response);
    })
    .catch((error) => {
      console.error('Error sending notification:', error);
    });
};
