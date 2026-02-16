import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlockedUsers() {
    const [blockedList, setBlockedList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        try {
            const response = await axios.get('/api/blocks');
            setBlockedList(response.data);
        } catch (err) {
            console.error("Erreur lors de la récupération des bloqués:", err);
        } finally {
            setLoading(false);
        }
    };

    const unblockUser = async (user) => {
        try {
            await axios.delete(`/api/blocks/${user.id}`);
            setBlockedList(blockedList.filter(item => item.blocked.id !== user.id));
        } catch (err) {
            console.error("Erreur lors du déblocage:", err);
            alert("Erreur lors du déblocage.");
        }
    };

    return (
        <div className="min-h-screen bg-[#101322] text-white font-sans pb-32">
            <Head title="Utilisateurs bloqués - Lumi" />

            <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/10 bg-[#101322]/80 backdrop-blur-xl">
                <Link href={'/settings'} className="w-10 h-10 flex items-center justify-start text-white">
                    <span className="material-symbols-outlined">arrow_back_ios</span>
                </Link>
                <h1 className="text-lg font-bold">Utilisateurs bloqués</h1>
                <div className="w-10" />
            </header>

            <main className="max-w-md mx-auto p-6">
                <p className="text-xs text-gray-500 mb-8 leading-relaxed italic">
                    Les personnes figurant dans cette liste ne peuvent plus vous envoyer de messages ni voir votre profil dans Discovery/Explorer.
                </p>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="size-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {blockedList.length > 0 ? (
                                blockedList.map((block) => (
                                    <motion.div
                                        key={block.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-[#161b2e] border border-white/5 p-4 rounded-3xl flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={block.blocked.avatar || 'https://via.placeholder.com/100'}
                                                className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                                                alt={block.blocked.name}
                                            />
                                            <div>
                                                <h3 className="text-sm font-bold uppercase tracking-tighter italic">{block.blocked.name}</h3>
                                                <p className="text-[10px] text-gray-500">Bloqué le {new Date(block.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => unblockUser(block.blocked)}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[#D4AF37] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                                        >
                                            Débloquer
                                        </button>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-20 opacity-40">
                                    <span className="material-symbols-outlined text-6xl mb-4">group_off</span>
                                    <p className="text-sm italic">Aucun utilisateur bloqué.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
