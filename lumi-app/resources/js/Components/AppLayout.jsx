import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import useMatchNotifications from '@/Hooks/useMatchNotifications';
import LocationTracker from './LocationTracker';

import NavigationBar from './NavigationBar';

export default function AppLayout({ children }) {
    const { url } = usePage();

    // Initialize match notifications listener
    useMatchNotifications();

    useEffect(() => {
        // Check local storage for theme preference
        const savedTheme = localStorage.getItem('theme');
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && isSystemDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Définir les routes où la NavigationBar doit apparaître
    const pathname = new URL(url, window.location.origin).pathname;
    const showNavBar = [
        '/discovery',
        '/explorer',
        '/likes',
        '/chat',
        '/my-profile',
        '/expert',
        '/settings',
        '/notifications'
    ].includes(pathname);

    return (
        <>
            <LocationTracker />
            {children}
            {showNavBar && <NavigationBar />}
        </>
    );
}
