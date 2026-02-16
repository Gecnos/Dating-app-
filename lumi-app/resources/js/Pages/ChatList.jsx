import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatList({ matches = [] }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Mock matches for UI demonstration if none provided
    const mockMatches = [
        {
            id: 1,
            name: 'Grace',
            last_message: "Salut ! Ton profil m'a beaucoup plu. 😊",
            last_message_time: '15 min',
            unread_count: 1,
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
            is_online: true,
            type: 'text'
        },
        {
            id: 2,
            name: 'Adebayo',
            last_message: "Note vocale",
            last_message_time: '2 h',
            unread_count: 0,
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
            is_online: false,
            type: 'voice',
            duration: '0:12'
        },
        {
            id: 3,
            name: 'Marie',
            last_message: "On se voit quand ?",
            last_message_time: 'Hier',
            unread_count: 0,
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
            is_online: true,
            type: 'text'
        }
    ];

    const displayMatches = matches.length > 0 ? matches : mockMatches;

    const filteredMatches = displayMatches.filter(match =>
        match.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#101322] text-[#111218] dark:text-white font-sans pb-32 overflow-x-hidden transition-colors duration-500">
            <Head title="Messages - Lumi" />

            <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#101322]/90 backdrop-blur-xl px-6 py-4 border-b border-gray-100 dark:border-white/5 transition-all">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase dark:text-[#D4AF37]">Messages</h1>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[#D4AF37] transition-colors">search</span>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-[#161b2e] border-0 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-[#D4AF37]/50 focus:bg-white dark:focus:bg-[#1f253d] transition-all"
                        placeholder="Rechercher une conversation..."
                    />
                </div>
            </header>

            <main className="max-w-lg mx-auto p-4">
                {/* Active Matches (Stories-like) */}
                <div className="mb-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 ml-2">Nouveaux Matchs</h2>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-2">
                        {displayMatches.map((match) => (
                            <div key={`story-${match.id}`} className="flex flex-col items-center gap-2 shrink-0">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full p-0.5 border-2 border-[#D4AF37] border-dashed animate-[spin_10s_linear_infinite]"></div>
                                    <img
                                        src={match.avatar}
                                        className="absolute inset-1 w-14 h-14 rounded-full object-cover border-2 border-white dark:border-[#101322]"
                                        alt={match.name}
                                    />
                                    {match.is_online && (
                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#101322] rounded-full"></div>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold truncate w-16 text-center">{match.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Conversations List */}
                <div className="space-y-1">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 ml-2">Conversations</h2>
                    <AnimatePresence>
                        {filteredMatches.map((match, idx) => (
                            <motion.div
                                key={match.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link
                                    href={route('chat.show', match.id)}
                                    className={`flex items-center gap-4 p-4 rounded-[2rem] transition-all active:scale-[0.98] ${match.unread_count > 0 ? 'bg-[#D4AF37]/5 dark:bg-[#D4AF37]/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img src={match.avatar} className="w-14 h-14 rounded-2xl object-cover" alt={match.name} />
                                        {match.is_online && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#101322] rounded-full"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-sm truncate">{match.name}</h3>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase">{match.last_message_time}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className={`text-xs truncate ${match.unread_count > 0 ? 'text-[#111218] dark:text-white font-bold' : 'text-gray-500'}`}>
                                                {match.type === 'voice' ? (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">mic</span>
                                                        Note vocale ({match.duration})
                                                    </span>
                                                ) : (
                                                    match.last_message
                                                )}
                                            </p>
                                            {match.unread_count > 0 && (
                                                <div className="bg-[#D4AF37] text-[#101322] text-[9px] font-black h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center">
                                                    {match.unread_count}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredMatches.length === 0 && (
                        <div className="pt-20 text-center px-10">
                            <p className="text-sm text-gray-500 italic">Aucune conversation trouvée pour "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </main>

        </div>
    );
}
