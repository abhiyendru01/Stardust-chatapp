
const backendUrl =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

self.addEventListener('push', (event) => {
    const { title, body, icon } = event.data.json().notification;
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon,
        badge: '/weave.png',  
      })
    );
  });
  
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
      console.log("Service Worker Registered: ", registration);
  
      // Request notification permission from the user
      Notification.requestPermission().then(function(permission) {
        if (permission === "granted") {
          console.log("Notification permission granted.");
  
          // Subscribe to push notifications
          registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array("BAxltHs2ILeYQMo7fO9xLYBDpfQKm81q-yqjLtwH3rrMs9dzm-oocImmXcEQSFeYpLXZU7q85qNdTYNhy5SifIg") // This key will be shared from the backend
          }).then(function(subscription) {
            // Send the subscription to the backend
            fetch(`${backendUrl}/api/push`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscription })
            })
            .then(response => response.json())
            .then(data => console.log("Subscription saved", data))
            .catch(err => console.log("Failed to send subscription", err));
          });
        } else {
          console.log("Notification permission denied.");
        }
      });
    });
  }
  
  // Function to convert VAPID key to the correct format
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  
  // sw.js - Add notification click event listener
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
  
    event.notification.close();  // Close the notification when clicked
  
    // Open a new window or focus an existing window/tab with the passed URL
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        const client = clientList.find((client) => client.url === event.notification.data.url);
        if (client) {
          return client.focus();  // Focus on the existing window if it's already open
        }
  
        // If no existing window, open a new one
        return self.clients.openWindow(event.notification.data.url);
      })
    );
  });
  