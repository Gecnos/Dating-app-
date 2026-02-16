import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import NavigationBar from '@/Components/NavigationBar';
import { motion } from 'framer-motion';

export default function Notifications() {
    const [filter, setFilter] = useState('all');

    // Mock data for display based on the mockup
    const notifications = [
        { id: 1, type: 'match', user: 'Mariam', action: 'Vous avez un nouveau match !', time: 'Il y a 2 min', unread: true, avatar: null },
        { id: 2, type: 'message', user: 'Koffi', action: 'Vous a envoyé un nouveau message vocal.', time: 'Il y a 15 min', unread: true, avatar: null },
        { id: 3, type: 'visit', user: 'Inconnu', action: 'Quelqu\'un a visité votre profil.', time: 'Il y a 1h', unread: false, avatar: null },
        { id: 4, type: 'verification', user: 'Système', action: 'Votre identité a été vérifiée avec succès !', time: 'Il y a 3h', unread: false, icon: 'verified' },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="flex h-screen w-full flex-col bg-[#101322] font-sans text-white overflow-hidden">
            <Head title="Notifications" />

            {/* Header */}
            <header className="bg-[#101322]/90 backdrop-blur-xl p-6 sticky top-0 z-20 border-b border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-black tracking-tight uppercase">Activités</h1>
                    {unreadCount > 0 && (
                        <div className="bg-[#D4AF37] text-[#101322] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-[#D4AF37]/20">
                            {unreadCount} Nouvelles
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {['Tout', 'Non lus', 'Matches', 'Système'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f.toLowerCase())}
                            className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${filter === f.toLowerCase() ? 'bg-[#D4AF37] text-[#101322] border-[#D4AF37]' : 'bg-white/5 text-gray-400 border-white/10'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 pb-32">
                {notifications.map((notif, index) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative group flex items-center gap-4 p-4 rounded-3xl border transition-all active:scale-[0.98] ${notif.unread ? 'bg-white/5 border-white/10 shadow-lg' : 'bg-transparent border-white/5 opacity-60'}`}
                    >
                        {/* Avatar or Icon */}
                        <div className="relative">
                            <div className="size-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10 overflow-hidden">
                                {notif.icon ? (
                                    <span className="material-symbols-outlined text-[#D4AF37]">{notif.icon}</span>
                                ) : (
                                    <span className="material-symbols-outlined text-gray-400">person</span>
                                )}
                            </div>
                            {notif.unread && (
                                <div className="absolute -top-1 -right-1 size-3.5 bg-[#D4AF37] rounded-full border-2 border-[#101322]" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="text-xs font-black uppercase tracking-tighter">
                                    {notif.user}
                                </h4>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{notif.time}</span>
                            </div>
                            <p className="text-[11px] text-gray-300 leading-tight">
                                {notif.action}
                            </p>
                        </div>

                        {/* Action Hint */}
                        <span className="material-symbols-outlined text-gray-600 group-hover:text-[#D4AF37] transition-colors">chevron_right</span>
                    </motion.div>
                ))}

                {notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <span className="material-symbols-outlined text-6xl mb-4">notifications_off</span>
                        <p className="text-sm font-bold uppercase tracking-widest">Aucune activité</p>
                        <p className="text-xs mt-2 text-gray-500 italic">Tout est calme ici...</p>
                    </div>
                )}
            </main>

            <NavigationBar />
        </div>
    );
}
