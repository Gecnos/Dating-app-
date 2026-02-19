import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useWebSocket } from './WebSocketProvider';
import axios from '../api/axios';

const NotificationsContext = createContext();

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
    const { user, bootstrapData } = useAuth();
    const { echo } = useWebSocket();

    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const [unreadLikesCount, setUnreadLikesCount] = useState(0);

    // Initial Fetch (Optimized)
    useEffect(() => {
        if (bootstrapData?.notifications) {
            setUnreadMessagesCount(bootstrapData.notifications.unread_messages || 0);
            setUnreadLikesCount(bootstrapData.notifications.unread_likes || 0);
        } else if (user) {
            fetchCounts();
        }
    }, [user, bootstrapData]); // Depend on bootstrapData too

    const fetchCounts = async () => {
        try {
            const response = await axios.get('/user/counts'); 
             if (response.data) {
                 setUnreadMessagesCount(response.data.unread_messages_count || 0);
                 setUnreadLikesCount(response.data.unread_notifications_count || 0);
             }
        } catch (error) {
            console.error("Failed to fetch notification counts", error);
        }
    };

    // WebSocket Listeners
    useEffect(() => {
        if (!user || !echo) return;

        console.log("NotificationsContext: Listening for events");

        // 1. Message Sent (Chat)
        const chatChannel = echo.private(`chat.${user.id}`);
        chatChannel.listen('.MessageSent', (data) => {
             console.log("NotificationsContext: Message Received", data);
             // Verify if it's from someone else
             const msg = data.message || data;
             if (msg.from_id !== user.id) {
                 setUnreadMessagesCount(prev => prev + 1);
             }
        });

        // 2. User Events (Likes, Matches)
        // 2. User Events (Likes, Matches)
        const userChannel = echo.private(`user.${user.id}`);
        
        userChannel.listen('.like.received', (e) => {
             console.log("Like received event:", e);
             setUnreadLikesCount(prev => prev + 1);
        });
        
        // Also try without dot just in case Echo needs it that way
        userChannel.listen('like.received', (e) => {
             console.log("Like received event (no dot):", e);
             setUnreadLikesCount(prev => prev + 1);
        });

         userChannel.listen('.match.created', (e) => {
             console.log("Match created event:", e);
             setUnreadLikesCount(prev => prev + 1);
        });
        
        userChannel.listen('match.created', (e) => {
             console.log("Match created event (no dot):", e);
             setUnreadLikesCount(prev => prev + 1);
        });


        return () => {
            echo.leave(`chat.${user.id}`);
            echo.leave(`user.${user.id}`);
        };
    }, [user, echo]);

    // Cleanup when reading
    const markMessagesAsRead = () => {
        // Logic to decrease count or reset. 
        // Realistically, when entering a chat, we fetch messages and backend marks them read.
        // We should re-fetch counts or decrement. 
        // For simplicity: simple decrement or reset isn't accurate enough without knowing WHICH chat.
        // Best approach: Re-fetch counts on navigation to specific pages.
    };

    const refreshCounts = () => {
        // Trigger a re-fetch of the user/counts
        axios.get('/user/counts').then(res => {
             setUnreadMessagesCount(res.data.unread_messages_count);
             setUnreadLikesCount(res.data.unread_notifications_count);
        });
    };


    return (
        <NotificationsContext.Provider value={{ 
            unreadMessagesCount, 
            unreadLikesCount, 
            setUnreadMessagesCount, 
            setUnreadLikesCount,
            refreshCounts 
        }}>
            {children}
        </NotificationsContext.Provider>
    );
};
