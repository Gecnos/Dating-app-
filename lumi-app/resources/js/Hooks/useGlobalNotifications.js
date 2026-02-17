import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function useGlobalNotifications() {
    const { auth, url } = usePage().props;

    useEffect(() => {
        if (!auth.user || !window.Echo) return;

        console.log("Global Notifications: Init for user", auth.user.id);

        // 1. Private User Channel (Matches, Likes)
        const userChannel = window.Echo.private(`user.${auth.user.id}`);
        
        userChannel.subscribed(() => {
            console.log("Global Notifications: Subscribed to user channel");
        });

        userChannel.listen('.match.created', (event) => {
            console.log("Global Notifications: Match Received!", event);
            // In product, maybe a toast. For now, redirect to success or show badge
            if (!url.includes('/match-success')) {
                router.visit(route('match.success', event.matched_user.id));
            }
        });

        userChannel.listen('.like.received', (event) => {
            console.log("Global Notifications: Like Received!", event);
            // Update badge (via state or Inertia reload if needed)
            // For now, simple console alert or toast can be added later
        });

        // 2. Private Chat Channel (Messages)
        // This is only for the "Global" part. 
        // If we are ALREADY in Chat.jsx, it has its own listener.
        const chatChannel = window.Echo.private(`chat.${auth.user.id}`);

        chatChannel.listen('.message.sent', (data) => {
            console.log("Global Notifications: Message Received!", data);
            
            // If NOT on the chat page with this person, show a notification
            const isCurrentChatPage = url.includes(`/chat/${data.from_id}`) || url === `/chat?id=${data.from_id}`;
            
            if (!isCurrentChatPage) {
                // Show a global toast or update unread badge
                console.log(`Nouveau message de ${data.from_id}`);
                // Optional: trigger sound or browser notification
            }
        });

        return () => {
            window.Echo.leave(`user.${auth.user.id}`);
            window.Echo.leave(`chat.${auth.user.id}`);
        };
    }, [auth.user, url]);
}
