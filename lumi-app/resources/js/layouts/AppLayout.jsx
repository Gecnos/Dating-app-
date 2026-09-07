import { useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { requestForToken, onForegroundMessage } from '../hooks/useFcm';
import LocationTracker from '../components/shared/LocationTracker';
import { useAuth } from '../contexts/AuthProvider';
import { useToast } from '../contexts/ToastContext';
import NavigationBar from '../components/shared/NavigationBar';

export default function AppLayout() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { info } = useToast();
    const url = location.pathname;

    // Initialize global events listener

    useEffect(() => {
        // Initialize FCM
        if (typeof window !== 'undefined' && user) {
            console.log("AppLayout: Requesting FCM permission for user", user.id);
            requestForToken();
        }
    }, [user]);

    // Foreground push notifications (app open, tab focused): FCM doesn't
    // surface these as OS notifications, so show an in-app toast instead.
    useEffect(() => {
        if (!user) return;

        const unsubscribe = onForegroundMessage((payload) => {
            const targetUrl = payload?.data?.url || payload?.data?.click_action;
            const title = payload?.notification?.title || 'Lumi';
            const body = payload?.notification?.body || '';
            info(
                body ? `${title} — ${body}` : title,
                5000,
                targetUrl ? () => navigate(targetUrl) : undefined
            );
        });

        return unsubscribe;
    }, [user]);

    // Background push notifications clicked while a tab is already open:
    // the service worker can only focus that tab, not change its route, so
    // it posts the target URL here for the SPA router to navigate to.
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const handleMessage = (event) => {
            if (event.data?.type === 'notification-click' && event.data.url) {
                navigate(event.data.url);
            }
        };

        navigator.serviceWorker.addEventListener('message', handleMessage);
        return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }, [navigate]);

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

    // Define routes where NavigationBar should appear
    const excludedPaths = [
        '/', '/login', '/register', '/onboarding', '/match-success',
        '/settings', '/profile/', '/help', '/legal', '/photos/manage'
    ];
    // Hide navbar in individual chats (e.g., /chat/5) but show in /chat list
    // Note: React Router params need checked differently, but simple path startsWith works for now
    const isIndividualChat = url.startsWith('/chat/') && url !== '/chat';

    // Check if current path matches any excluded path
    const isExcluded = excludedPaths.some(path => {
        if (path === '/') return url === '/';
        return url.startsWith(path);
    });

    const showNavBar = user && !isIndividualChat && !isExcluded;

    return (
        <>
            <LocationTracker />
            <AnimatePresence mode="wait">
                <motion.div
                    key={url}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="w-full h-full"
                >
                    <Outlet />
                </motion.div>
            </AnimatePresence>
            {showNavBar && <NavigationBar />}
        </>
    );
}
