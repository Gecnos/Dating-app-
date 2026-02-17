import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function useGlobalNotifications() {
    const { auth } = usePage().props;
    const { url } = usePage();

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
            
            // 1. If on the Matches/Likes page, refresh the list
            if (url && url.includes('/likes')) {
                router.reload({ only: ['receivedLikes', 'sentLikes'] });
            }

            // 2. Redirect to success if not already there
            if (url && !url.includes('/match-success')) {
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
            
            // 1. If on the Chat List page, refresh the list of matches/conversations
            if (url && (url === '/chat' || url === '/chat/')) {
                router.reload({ only: ['matches'] });
            }

            // 2. If NOT on the chat page with this person, show a notification
            const isCurrentChatPage = url && (url.includes(`/chat/${data.from_id}`) || url === `/chat?id=${data.from_id}`);
            
            if (!isCurrentChatPage) {
                // Here we could trigger a global state update or toast
                console.log(`Nouveau message de ${data.from_id}`);
                
                // Refresh top-level props (like unread counts in navbar if we add them later)
                router.reload({ only: ['auth'] }); 
            }
        });

        return () => {
            window.Echo.leave(`user.${auth.user.id}`);
            window.Echo.leave(`chat.${auth.user.id}`);
        };
    }, [auth.user, url]);
}
