import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import useMatchNotifications from '@/Hooks/useMatchNotifications';
import LocationTracker from './LocationTracker';

export default function AppLayout({ children }) {
    // Initialize match notifications listener
    useMatchNotifications();

    return (
        <>
            <LocationTracker />
            {children}
        </>
    );
}
