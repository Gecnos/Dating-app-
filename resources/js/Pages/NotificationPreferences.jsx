import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthProvider';
import { useToast } from '../contexts/ToastContext';

const CATEGORIES = [
    { key: 'notify_push_messages', icon: 'chat_bubble', label: 'Messages', hint: 'Nouveau message reçu' },
    { key: 'notify_push_matches', icon: 'favorite', label: 'Matchs', hint: 'Quelqu\'un et vous vous êtes plu' },
    { key: 'notify_push_likes', icon: 'thumb_up', label: 'Likes', hint: 'Quelqu\'un vous a liké' },
    { key: 'notify_push_announcements', icon: 'campaign', label: 'Annonces', hint: 'Actualités et alertes de sécurité' },
];

export default function NotificationPreferences() {
    const navigate = useNavigate();
    const { user: authUser, setUser: setAuthUser } = useAuth();
    const { error } = useToast();

    const [prefs, setPrefs] = useState(() => {
        const initial = {};
        CATEGORIES.forEach(({ key }) => {
            initial[key] = authUser?.[key] !== undefined ? !!authUser[key] : true;
        });
        return initial;
    });

    const toggle = async (key) => {
        const newValue = !prefs[key];
        const previous = prefs;
        setPrefs({ ...prefs, [key]: newValue });

        try {
            await axios.post('/preferences/notifications', { [key]: newValue });
            if (setAuthUser && authUser) {
                setAuthUser({ ...authUser, [key]: newValue });
            }
        } catch (err) {
            setPrefs(previous);
            console.error(err);
            error("Impossible de mettre à jour cette préférence.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] text-[#101322] dark:text-white font-['Be_Vietnam_Pro'] pb-32 transition-colors duration-500">
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#101322]/90 backdrop-blur-xl px-6 py-4 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-[#1a1f35] active:bg-gray-200 dark:active:bg-white/10 transition-all">
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                </button>
                <h1 className="text-lg font-black uppercase italic tracking-tighter">Notifications push</h1>
            </header>

            <main className="max-w-lg mx-auto p-6 space-y-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
                    Ces réglages contrôlent uniquement les alertes envoyées à votre appareil. Vous continuerez à voir toutes vos notifications dans l'app.
                </p>

                <div className="rounded-3xl border bg-white dark:bg-[#161b2e] border-black/5 dark:border-white/5 shadow-sm divide-y divide-black/5 dark:divide-white/5 transition-colors duration-500">
                    {CATEGORIES.map(({ key, icon, label, hint }) => (
                        <div key={key} className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#D4AF37]/10 text-[#D4AF37] transition-colors duration-500">
                                    <span className="material-symbols-outlined text-xl">{icon}</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold">{label}</p>
                                    <p className="text-[9px] text-gray-500">{hint}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={!!prefs[key]} onChange={() => toggle(key)} className="sr-only peer" />
                                <div className={`w-11 h-6 rounded-full peer transition-all ${prefs[key] ? 'bg-[#D4AF37] after:translate-x-full after:border-white' : 'bg-gray-200'} after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                            </label>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
