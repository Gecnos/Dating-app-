import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('tout');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/notifications')
            .then(res => {
                setNotifications(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const displayNotifications = notifications.filter(n => {
        if (filter === 'tout') return true;
        if (filter === 'nonlu') return n.is_unread;
        if (filter === 'matchs') return n.type === 'match';
        return true;
    });

    const markAsRead = () => {
        axios.post('/api/notifications/read').then(() => {
            setNotifications(notifications.map(n => ({ ...n, is_unread: false })));
        });
    };

    const filters = [
        { id: 'tout', label: 'Tout' },
        { id: 'nonlu', label: 'Non lu' },
        { id: 'matchs', label: 'Matchs' }
    ];

    return (
        <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#101322] text-[#111218] dark:text-white font-sans pb-32 overflow-x-hidden transition-colors duration-500">
            <Head title="Notifications - Lumi" />

            <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#101322]/90 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 transition-all">
                <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-start rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <h1 className="text-lg font-bold">Notifications</h1>
                <button
                    onClick={markAsRead}
                    className="w-10 h-10 flex items-center justify-end rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
                    title="Tout marquer comme lu"
                >
                    <span className="material-symbols-outlined text-gray-500">checklist</span>
                </button>
            </header>

            <main className="max-w-lg mx-auto">
                {/* Filters */}
                <div className="px-6 py-4 sticky top-[73px] z-40 bg-[#F9F9FB]/80 dark:bg-[#101322]/80 backdrop-blur-md">
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                        {filters.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all active:scale-95 ${filter === f.id
                                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-black/10'
                                    : 'bg-white dark:bg-[#161b2e] border border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="flex flex-col">
                    <div className="px-6 py-3">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Aujourd'hui</h2>
                    </div>

                    <AnimatePresence>
                        {displayNotifications.map((notif, idx) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`p-6 border-b border-gray-50 dark:border-white/5 flex gap-4 hover:bg-[#D4AF37]/5 transition-colors cursor-pointer group relative ${notif.is_unread ? 'bg-[#D4AF37]/5 dark:bg-[#D4AF37]/5' : 'bg-white dark:bg-[#101322]'}`}
                            >
                                <div className="relative flex-shrink-0">
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                                        style={{ backgroundColor: `${notif.color}20` }}
                                    >
                                        <span className="material-symbols-outlined text-2xl" style={{ color: notif.color, fontVariationSettings: "'FILL' 1" }}>
                                            {notif.icon}
                                        </span>
                                    </div>
                                    {notif.is_unread && (
                                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#101322] p-0.5 rounded-full">
                                            <div className="w-3.5 h-3.5 rounded-full bg-[#D4AF37] border-2 border-white dark:border-[#101322] animate-pulse"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`font-bold text-sm ${notif.is_unread ? 'text-[#111218] dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {notif.title}
                                        </h3>
                                        <span className={`text-[10px] font-bold ${notif.is_unread ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
                                            {notif.time}
                                        </span>
                                    </div>
                                    <p className={`text-xs line-clamp-2 ${notif.is_unread ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-500'}`}>
                                        {notif.content}
                                    </p>
                                </div>
                                {notif.is_unread && (
                                    <div className="flex items-center justify-center">
                                        <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Empty State Illustration Placeholder (Optional) */}
                {displayNotifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center pt-20 px-10 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-[#161b2e] rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl text-gray-300">notifications_off</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2">Pas de notifications</h3>
                        <p className="text-sm text-gray-500 italic">Nous vous tiendrons au courant dès qu'il y aura du nouveau !</p>
                    </div>
                )}
            </main>
        </div>
    );
}
