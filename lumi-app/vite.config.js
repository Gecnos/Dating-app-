import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

// Regenerates public/firebase-messaging-sw.js from VITE_FIREBASE_* env vars
// on every dev/build instead of committing Firebase credentials to the repo.
function generateFirebaseServiceWorker(env) {
    const required = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID',
    ];
    const missing = required.filter((key) => !env[key]);
    const outFile = path.resolve('public/firebase-messaging-sw.js');

    if (missing.length) {
        console.warn(
            `[firebase-sw] Skipping generation of firebase-messaging-sw.js, missing env vars: ${missing.join(', ')}`,
        );
        return;
    }

    const config = {
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID,
        ...(env.VITE_FIREBASE_MEASUREMENT_ID && { measurementId: env.VITE_FIREBASE_MEASUREMENT_ID }),
    };

    const content = `importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Auto-generated at build time from VITE_FIREBASE_* env vars — do not edit directly.
firebase.initializeApp(${JSON.stringify(config, null, 2)});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const relativeUrl = event.notification.data?.click_action || '/';
  // client.url from clients.matchAll() is always absolute, so resolve
  // relativeUrl against our own origin before comparing — otherwise the
  // comparison never matches and every click opens a duplicate tab.
  const urlToOpen = new URL(relativeUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.split('#')[0] === urlToOpen.split('#')[0] && 'focus' in client) {
          return client.focus();
        }
      }
      // No tab already on that exact URL: focus/open one and tell the SPA
      // (a client-side router) where to navigate, since focusing alone
      // won't change the route of an already-open tab on a different page.
      if (windowClients.length > 0 && 'focus' in windowClients[0]) {
        windowClients[0].postMessage({ type: 'notification-click', url: relativeUrl });
        return windowClients[0].focus();
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
`;

    fs.writeFileSync(outFile, content);
    console.log('[firebase-sw] Generated public/firebase-messaging-sw.js from env vars');
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    generateFirebaseServiceWorker(env);

    return {
        plugins: [
            tailwindcss(),
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.jsx'],
                refresh: true,
            }),
            react(),
        ],
        server: {
            host: '0.0.0.0',
            hmr: {
                host: 'localhost',
            },
            allowedHosts: true,
        },
    };
});
