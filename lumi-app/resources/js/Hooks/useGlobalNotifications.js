import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { useWebSocket } from '../contexts/WebSocketProvider';

export default function useGlobalNotifications() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const { echo } = useWebSocket();

    useEffect(() => {
        if (!user || !echo) return;

        console.log("Global Notifications: Init for user", user.id);

        // 1. Private User Channel (Matches, Likes)
        const userChannel = echo.private(`user.${user.id}`);
        
        userChannel.subscribed(() => {
            console.log("Global Notifications: Subscribed to user channel");
        });

        userChannel.listen('.match.created', (event) => {
            console.log("Global Notifications: Match Received!", event);
            
            // 2. Redirect to success if not already there
            if (!currentPath.includes('/match/success')) {
                navigate(`/match/success/${event.matched_user.id}`);
            }
        });

        userChannel.listen('.like.received', (event) => {
            console.log("Global Notifications: Like Received!", event);
            // Optional: Show toast or update badge count context
        });

        // 2. Private Chat Channel (Messages)
        const chatChannel = echo.private(`chat.${user.id}`);

        chatChannel.listen('.message.sent', (data) => {
            console.log("Global Notifications: Message Received!", data);
            
            // 1. If on the Chat List page, we might want to refresh list (handled by ChatList component usually)
            
            // 2. If NOT on the chat page with this person, show a notification/toast
            const isCurrentChatPage = currentPath.includes(`/chat/${data.from_id}`);
            
            if (!isCurrentChatPage) {
                console.log(`Nouveau message de ${data.from_id}`);
                // Trigger toast here
            }
        });

        return () => {
            echo.leave(`user.${user.id}`);
            echo.leave(`chat.${user.id}`);
        };
    }, [user, currentPath, echo]);
}
