import React, { useState, useEffect } from 'react';
import { Head, Link, Deferred } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Likes({ receivedLikes: initialReceived, sentLikes: initialSent, isPremium }) {
    const [activeTab, setActiveTab] = useState('received');
    const [receivedLikes, setReceivedLikes] = useState([]);
    const [sentLikes, setSentLikes] = useState([]);

    React.useEffect(() => {
        if (initialReceived) setReceivedLikes(initialReceived);
        if (initialSent) setSentLikes(initialSent);
    }, [initialReceived, initialSent]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#101322] font-sans text-white">
            <Head title="Likes" />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#101322] border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <h1 className="text-xl font-black tracking-tight uppercase italic">Vos Coups de Cœur</h1>
                    <div className="flex items-center gap-2 bg-[#D4AF37]/20 px-3 py-1.5 rounded-full border border-[#D4AF37]/30">
                        <span className="material-symbols-outlined text-[#D4AF37] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>crown</span>
                        <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-wider">{isPremium ? 'Membre Premium' : 'Lumi Free'}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex mt-8 bg-[#161b2e] rounded-2xl p-1.5 max-w-lg mx-auto border border-white/5 shadow-inner">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'received' ? 'bg-[#D4AF37] text-[#101322] shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Reçus ({receivedLikes?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sent' ? 'bg-[#D4AF37] text-[#101322] shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Envoyés ({sentLikes?.length || 0})
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 pb-32">
                <Deferred data={['receivedLikes', 'sentLikes']} fallback={
                    <div className="grid grid-cols-2 gap-4 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[3/4] rounded-[2rem] bg-white/5 border border-white/10" />
                        ))}
                    </div>
                }>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {(activeTab === 'received' ? receivedLikes : sentLikes).map((like, index) => (
                                <Link
                                    key={like.id}
                                    href={route('profile', like.user?.id || '#')}
                                    className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl transition-all active:scale-95 bg-[#161b2e]"
                                >
                                    <div className="absolute inset-0">
                                        <img
                                            src={like.user?.avatar || 'https://via.placeholder.com/400x600'}
                                            alt={like.user?.name}
                                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110`}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#101322] via-transparent to-transparent opacity-90" />
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4 text-center">
                                        <div className="flex flex-col items-center gap-1 mb-1">
                                            <h3 className="text-xs font-black uppercase tracking-tighter italic truncate w-full">
                                                {like.user?.name || 'Utilisateur Lumi'}
                                            </h3>
                                            {like.user?.is_verified && (
                                                <span className="material-symbols-outlined text-[#D4AF37] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center gap-1.5 opacity-60">
                                            <span className="material-symbols-outlined text-xs text-[#D4AF37]">{like.user?.intention?.icon || 'favorite'}</span>
                                            <p className="text-[9px] font-black uppercase tracking-widest truncate">{like.user?.intention?.label || 'Sérieux'}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </Deferred>

                {/* Empty State */}
                {(activeTab === 'received' ? receivedLikes : sentLikes).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="size-20 bg-[#161b2e] rounded-full flex items-center justify-center mb-6 border border-white/5">
                            <span className="material-symbols-outlined text-4xl text-gray-600">favorite</span>
                        </div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">Aucun Like</p>
                        <p className="text-xs mt-3 text-gray-600 font-medium px-10 leading-relaxed italic">
                            {activeTab === 'received'
                                ? "Ne découragez pas ! Votre profil sera bientôt remarqué."
                                : "N'hésitez pas à envoyer des likes pour briser la glace !"}
                        </p>
                    </div>
                )}

                {/* Premium CTA if not premium */}
                {activeTab === 'received' && !isPremium && receivedLikes.length > 0 && (
                    <div className="mt-12 p-8 rounded-[2.5rem] bg-[#D4AF37] text-[#101322] shadow-2xl shadow-[#D4AF37]/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black leading-tight mb-2 italic tracking-tighter uppercase">Boostez vos chances</h4>
                            <p className="text-xs font-bold opacity-70 mb-8 leading-relaxed">Voyez instantanément qui vous a liké et passez directement au match.</p>
                            <Link href={route('credits')} className="inline-flex w-full items-center justify-center h-14 rounded-2xl bg-[#101322] text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl">
                                Devenir Premium
                            </Link>
                        </div>
                        <span className="material-symbols-outlined absolute -top-4 -right-4 text-8xl text-white/10 rotate-12">crown</span>
                    </div>
                )}
            </main>
        </div >
    );
}
