import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from '../api/axios';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export const requestForToken = async () => {
    if (!messaging) {
        console.warn(
            "FCM: Messaging not initialized (browser may not support it or SSR)",
        );
        return null;
    }

    try {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
            console.error(
                "FCM: VAPID Key missing in .env (VITE_FIREBASE_VAPID_KEY)",
            );
            return null;
        }

        // Ensure service worker is registered before requesting token
        if ("serviceWorker" in navigator) {
            try {
                const registration = await navigator.serviceWorker.register(
                    "/firebase-messaging-sw.js",
                    {
                        scope: "/firebase-cloud-messaging-push-scope",
                    },
                );
                console.log(
                    "FCM: Service Worker registered with scope:",
                    registration.scope,
                );

                console.log("FCM: Requesting token...");
                const currentToken = await getToken(messaging, {
                    vapidKey: vapidKey,
                    serviceWorkerRegistration: registration,
                });

                if (currentToken) {
                    console.log("FCM: Token generated:", currentToken);
                    // Sync with server using authenticated axios (prefix/api is base url)
                    await axios.post("/fcm-token", {
                        token: currentToken,
                        device_type: "web",
                    });
                    console.log("FCM: Token synced with server.");
                    return currentToken;
                } else {
                    console.warn("FCM: No registration token available.");
                    return null;
                }
            } catch (swError) {
                console.error(
                    "FCM: Service Worker registration failed:",
                    swError,
                );
                return null;
            }
        } else {
            console.warn(
                "FCM: Service workers are not supported in this browser.",
            );
            return null;
        }
    } catch (err) {
        console.error("FCM: Error retrieving token:", err);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => {
            console.log("Payload received: ", payload);
            resolve(payload);
        });
    });
