import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import useMatchNotifications from '@/Hooks/useMatchNotifications';

export default function AppLayout({ children }) {
    // Initialize match notifications listener
    useMatchNotifications();

    return <>{children}</>;
}
