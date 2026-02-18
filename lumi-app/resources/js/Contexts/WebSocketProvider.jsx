import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [echo, setEcho] = useState(null);

    useEffect(() => {
        if (user && token && !echo) {
            window.Pusher = Pusher;

            const echoInstance = new Echo({
                broadcaster: 'reverb',
                key: import.meta.env.VITE_REVERB_APP_KEY,
                wsHost: import.meta.env.VITE_REVERB_HOST,
                wsPort: import.meta.env.VITE_REVERB_PORT,
                wssPort: import.meta.env.VITE_REVERB_PORT,
                forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
                enabledTransports: ['ws', 'wss'],
                authEndpoint: '/api/broadcasting/auth',
                auth: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                },
            });

            console.log("WebSocket: Connected");
            setEcho(echoInstance);

            return () => {
                console.log("WebSocket: Disconnecting");
                echoInstance.disconnect();
                setEcho(null);
            };
        }
    }, [user, token]);

    return (
        <WebSocketContext.Provider value={echo}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
