importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// We proxy these via env or just hardcode if they don't change often.
// For now, I'll use placeholders that the user can fill or I can replace if I have the values.
firebase.initializeApp({
  apiKey: "AIzaSyDOZN6bq_5kEXJX4JGdMnB7MiTtI5pp83A",
  authDomain: "lumi-4c65e.firebaseapp.com",
  projectId: "lumi-4c65e",
  storageBucket: "lumi-4c65e.firebasestorage.app",
  messagingSenderId: "962422154347",
  appId: "1:962422154347:web:4d6a571041154f46467d2e",
  measurementId: "G-7KEKTMWQPL"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png',
    data: payload.data // Pass data so it's available in notificationclick
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.click_action || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open with the same URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
