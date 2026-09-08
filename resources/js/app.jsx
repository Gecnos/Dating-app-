import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { WebSocketProvider } from './contexts/WebSocketProvider';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { CacheProvider } from './contexts/CacheContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import AppRoutes from './routes';

// PWA shell/offline cache — separate from firebase-messaging-sw.js, which
// registers itself (scoped to its own virtual path) inside useFcm.js.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
            console.error('PWA service worker registration failed:', err);
        });
    });
}

const container = document.getElementById('app');
const root = createRoot(container);

root.render(
    <AuthProvider>
        <WebSocketProvider>
            <NotificationsProvider>
                <CacheProvider>
                    <ToastProvider>
                        <ConfirmProvider>
                            <BrowserRouter>
                                <AppRoutes />
                            </BrowserRouter>
                        </ConfirmProvider>
                    </ToastProvider>
                </CacheProvider>
            </NotificationsProvider>
        </WebSocketProvider>
    </AuthProvider>
);
