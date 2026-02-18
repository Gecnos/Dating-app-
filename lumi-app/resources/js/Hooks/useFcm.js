import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "../api/axios";

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

        console.log("FCM: Requesting token...");
        const currentToken = await getToken(messaging, {
            vapidKey: vapidKey,
        });

        if (currentToken) {
            console.log("FCM: Token generated:", currentToken);
            // Sync with server
            await axios.post("/fcm-token", {
                token: currentToken,
                device_type: "web",
            });
            console.log("FCM: Token synced with server.");
            return currentToken;
        } else {
            console.warn(
                "FCM: No registration token available. Request permission to generate one.",
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
