/* global importScripts, firebase, clients */

importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

// ✅ Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyDDL8n-cfyXtocY1deAuFY2LBsVVkLn1uw",
    authDomain: "chatapp-678e2.firebaseapp.com",
    projectId: "chatapp-678e2",
    storageBucket: "chatapp-678e2.appspot.com",
    messagingSenderId: "806602114681",
    appId: "1:806602114681:web:c8e427920ff3425d1f76a8"
});

const messaging = firebase.messaging();

// ✅ Handle background push notifications
messaging.onBackgroundMessage((payload) => {
    console.log("📩 Background message received:", payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || "/default-icon.png",
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ Handle Notification Clicks
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow("https://chatapp003.vercel.app"));
});
