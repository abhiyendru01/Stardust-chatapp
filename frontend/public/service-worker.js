self.addEventListener('push', function(event) {
    const options = {
      body: event.data?.text() || 'You have a new message!',
      icon: event.data?.json()?.icon || '/avatar.png',
      badge: '/weave.png',
    };
  
    event.waitUntil(
      self.registration.showNotification(event.data?.json()?.title || 'New Message', options)
    );
  });
  
  self.addEventListener('notificationclick', function(event) {
    const url = event.notification.data?.url || '/';
    event.notification.close();
    event.waitUntil(
      self.clients.openWindow(url)
    );
  });
  