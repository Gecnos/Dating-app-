import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatList({ matches = [] }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Séparer les nouveaux matches (pas de message) des conversations actives
    const newMatches = matches.filter(m => m.last_message_timestamp === 0);
    const activeConversations = matches.filter(m => m.last_message_timestamp > 0);

    const filteredConversations = activeConversations.filter(match =>
        match.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] text-[#101322] dark:text-white font-sans pb-32 overflow-x-hidden transition-colors duration-500">
            <Head title="Messages - Lumi" />

            <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#101322]/90 backdrop-blur-xl px-6 py-4 border-b border-black/5 dark:border-white/5 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase text-[#101322] dark:text-[#D4AF37] transition-colors duration-500">Messages</h1>
                    <Link href={route('settings')} className="size-10 rounded-xl bg-gray-100 dark:bg-[#1a1f35] flex items-center justify-center border border-black/5 dark:border-white/10">
                        <span className="material-symbols-outlined text-gray-400">tune</span>
                    </Link>
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
                        className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-[#161b2e] border border-black/5 dark:border-0 rounded-2xl text-sm text-[#101322] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#D4AF37]/50 focus:bg-white dark:focus:bg-[#1f253d] transition-all shadow-sm dark:shadow-none transition-colors duration-500"
                        placeholder="Rechercher une conversation..."
                    />
                </div>
            </header>

            <main className="max-w-lg mx-auto">
                {/* Nouveaux Matches - Horizontal Scroll */}
                {newMatches.length > 0 && (
                    <div className="py-6">
                        <div className="px-6 mb-4 flex items-center justify-between">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Nouveaux Matches</h2>
                            <span className="size-5 bg-[#D4AF37] text-[#101322] text-[9px] font-black rounded-full flex items-center justify-center">{newMatches.length}</span>
                        </div>
                        <div className="flex overflow-x-auto px-6 gap-4 no-scrollbar pb-2">
                            {newMatches.map((match) => (
                                <Link
                                    key={match.id}
                                    href={route('chat.show', match.id)}
                                    className="flex flex-col items-center gap-2 shrink-0 group"
                                >
                                    <div className="relative">
                                        <div className="size-16 rounded-[1.5rem] p-0.5 bg-gradient-to-tr from-[#D4AF37] to-[#FFD700] ring-4 ring-[#D4AF37]/10 group-active:scale-90 transition-all duration-300">
                                            <img
                                                src={match.avatar}
                                                className="w-full h-full rounded-[1.3rem] object-cover border-2 border-white dark:border-[#101322]"
                                                alt={match.name}
                                            />
                                        </div>
                                        {match.is_online && (
                                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#101322] rounded-full"></div>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-black uppercase italic text-[#101322] dark:text-white truncate w-16 text-center">{match.name.split(' ')[0]}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Conversations List */}
                <div className="p-4 space-y-1">
                    <div className="flex items-center justify-between mb-4 ml-2">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Messages</h2>
                    </div>

                    <AnimatePresence>
                        {filteredConversations.map((match, idx) => (
                            <motion.div
                                key={match.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link
                                    href={route('chat.show', match.id)}
                                    className={`flex items-center gap-4 p-4 rounded-[2rem] transition-all active:scale-[0.98] transition-colors duration-500 group hover:bg-white dark:hover:bg-white/5 border border-transparent`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className={`p-0.5 rounded-2xl transition-all`}>
                                            <img
                                                src={match.avatar}
                                                className="w-16 h-16 rounded-[1.2rem] object-cover border-2 border-white dark:border-[#101322] transition-colors duration-500"
                                                alt={match.name}
                                            />
                                        </div>
                                        {match.is_online && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#101322] rounded-full transition-colors duration-500"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={`font-black tracking-tight text-sm truncate uppercase italic transition-colors duration-500 ${match.unread_count > 0 ? 'text-[#D4AF37]' : 'text-[#101322] dark:text-white'}`}>{match.name}</h3>
                                            <span className={`text-[9px] font-black transition-colors duration-500 ${match.unread_count > 0 ? 'text-[#D4AF37]' : 'text-gray-400'}`}>{match.last_message_time}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <p className={`text-xs truncate transition-colors duration-500 flex-1 ${match.unread_count > 0 ? 'text-[#101322] dark:text-white font-black italic' : 'text-gray-400 dark:text-gray-500'}`}>
                                                {match.type === 'voice' ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[16px] text-[#D4AF37]">mic</span>
                                                        Note vocale ({match.duration})
                                                    </span>
                                                ) : (
                                                    match.last_message
                                                )}
                                            </p>
                                            {match.unread_count > 0 && (
                                                <div className="bg-[#D4AF37] text-[#101322] text-[10px] font-black h-5 min-w-[20px] px-2 rounded-full flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                                                    {match.unread_count}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredConversations.length === 0 && activeConversations.length > 0 && (
                        <div className="py-10 text-center opacity-40">
                            <p className="text-xs italic">Aucun résultat pour "{searchQuery}"</p>
                        </div>
                    )}

                    {activeConversations.length === 0 && (
                        <div className="pt-20 text-center px-10 flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-700">chat_bubble_outline</span>
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-white mb-1">Aucune conversation</h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500 italic">Lancez le premier pas !</p>
                        </div>
                    )}
                </div>
            </main>

        </div>
    );
}
