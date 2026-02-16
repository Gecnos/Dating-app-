import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function useMatchNotifications() {
    const { auth } = usePage().props;

    useEffect(() => {
        if (!auth.user || !window.Echo) return;

        const channel = window.Echo.channel(`user.${auth.user.id}`);

        channel.listen('.match.created', (event) => {
            // Redirect to match success page
            router.visit(route('match.success', event.matched_user.id));
        });

        return () => {
            channel.stopListening('.match.created');
            window.Echo.leave(`user.${auth.user.id}`);
        };
    }, [auth.user]);
}
