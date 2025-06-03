// Service Worker - Push Event Listener
self.addEventListener('push', (event) => {
  let data = {};

  // Safely parse notification data from the push event
  try {
    data = event.data.json().notification || {}; // Extract notification data
    console.log('Push event received:', data); // Debugging line
  } catch (error) {
    console.error('Error parsing push event data:', error);
  }

  // Extract title, body, and icon (fallback if missing)
  const { title, body, icon } = data;
  const notificationTitle = title || 'New Message';
  const notificationBody = body || 'You have a new message';
  const notificationIcon = icon || '/default-icon.png'; // Fallback to default icon

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notificationTitle, {
      body: notificationBody,
      icon: notificationIcon,
      badge: '/weave.png', // Badge icon
      data: { url: data.url || '/default-url' }, // URL for click event
    })
  );
});

// Notification Click Event Listener - Open URL when clicked
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close(); // Close the notification when clicked

  // Open or focus the appropriate window
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      const client = clientList.find((client) => client.url === event.notification.data.url);
      if (client) {
        return client.focus();  // Focus on existing window
      }

      // Open a new window if no existing window matches the URL
      return self.clients.openWindow(event.notification.data.url);
    })
  );
});
