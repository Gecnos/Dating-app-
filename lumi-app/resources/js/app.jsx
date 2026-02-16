import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import AppLayout from './Components/AppLayout';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Lumi';

createInertiaApp({
    resolve: async (name) => {
        const page = await resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx'));
        page.default.layout = page.default.layout || (page => <AppLayout children={page} />);
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#FBBF24', // Or / Yellow color from mockup
    },
});
