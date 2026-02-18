import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { WebSocketProvider } from './contexts/WebSocketProvider';
import AppRoutes from './routes';

const container = document.getElementById('app');
const root = createRoot(container);

root.render(
    <AuthProvider>
        <WebSocketProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </WebSocketProvider>
    </AuthProvider>
);
