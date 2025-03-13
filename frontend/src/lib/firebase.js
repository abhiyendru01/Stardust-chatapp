// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDDL8n-cfyXtocY1deAuFY2LBsVVkLn1uw",
  authDomain: "chatapp-678e2.firebaseapp.com",
  databaseURL: "https://chatapp-678e2-default-rtdb.firebaseio.com",
  projectId: "chatapp-678e2",
  storageBucket: "chatapp-678e2.firebasestorage.app",
  messagingSenderId: "806602114681",
  appId: "1:806602114681:web:c8e427920ff3425d1f76a8",
   measurementId: "G-EM3WZ8NRDG"
};
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ✅ Function to get FCM token for push notifications
export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "YOUR_PUBLIC_VAPID_KEY", // 🔹 Get this from Firebase Console > Cloud Messaging
      });
      console.log("FCM Token:", token);
      return token;
    } else {
      console.warn("🔴 Permission denied for notifications");
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting FCM token:", error);
    return null;
  }
};

// ✅ Handle incoming foreground messages
onMessage(messaging, (payload) => {
  console.log("📩 Received foreground message:", payload);
  new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.icon || "/default-icon.png",
  });
});


export { messaging, getToken, onMessage };

