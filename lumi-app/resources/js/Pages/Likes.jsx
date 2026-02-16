import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import NavigationBar from '@/Components/NavigationBar';
import { motion, AnimatePresence } from 'framer-motion';

export default function Likes({ receivedLikes, sentLikes, isPremium }) {
    const [activeTab, setActiveTab] = useState('received');

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#101322] font-sans text-white">
            <Head title="Likes" />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#101322]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <h1 className="text-xl font-black tracking-tight uppercase">Vos Likes</h1>
                    <div className="flex items-center gap-2 bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20">
                        <span className="material-symbols-outlined text-[#D4AF37] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>crown</span>
                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">{isPremium ? 'Premium' : 'Lumi Free'}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex mt-6 bg-white/5 rounded-2xl p-1 max-w-lg mx-auto">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'received' ? 'bg-[#D4AF37] text-[#101322] shadow-lg shadow-[#D4AF37]/20' : 'text-gray-400 hover:text-white'}`}
                    >
                        Reçus ({receivedLikes.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'sent' ? 'bg-[#D4AF37] text-[#101322] shadow-lg shadow-[#D4AF37]/20' : 'text-gray-400 hover:text-white'}`}
                    >
                        Envoyés ({sentLikes.length})
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-32">
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
                                href={route('profile', like.user.id)}
                                className="group relative aspect-[3/4] rounded-3xl overflow-hidden border border-white/5 shadow-2xl transition-transform active:scale-95"
                            >
                                {/* Photo avec flou si reçu et non premium */}
                                <div className="absolute inset-0">
                                    <img
                                        src={like.user.avatar || 'https://via.placeholder.com/400x600'}
                                        alt={like.user.name}
                                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${activeTab === 'received' && !isPremium ? 'blur-2xl scale-110' : ''}`}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                </div>

                                {/* Info */}
                                <div className="absolute bottom-3 left-3 right-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-sm font-bold truncate">
                                            {activeTab === 'received' && !isPremium ? 'Profil Lumi' : like.user.name}
                                        </h3>
                                        {like.user.is_verified && (
                                            <span className="material-symbols-outlined text-[#D4AF37] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-70">
                                        <span className="material-symbols-outlined text-[12px]">{like.user.intention?.icon || 'favorite'}</span>
                                        <p className="text-[10px] font-bold uppercase tracking-wider truncate">{like.user.intention?.label || 'Sérieux'}</p>
                                    </div>
                                </div>

                                {/* Premium Overlay pour Likes reçus */}
                                {activeTab === 'received' && !isPremium && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                                        <div className="bg-[#D4AF37] p-2 rounded-full mb-2">
                                            <span className="material-symbols-outlined text-[#101322] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-tighter text-center leading-none">Débloquer avec Premium</p>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Empty State */}
                {(activeTab === 'received' ? receivedLikes : sentLikes).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <span className="material-symbols-outlined text-6xl mb-4">favorite</span>
                        <p className="text-sm font-bold uppercase tracking-widest">Aucun like pour le moment</p>
                        <p className="text-xs mt-2 px-10">Continuez à swiper pour faire de nouvelles rencontres !</p>
                    </div>
                )}

                {/* Premium CTA if not premium */}
                {activeTab === 'received' && !isPremium && receivedLikes.length > 0 && (
                    <div className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-[#D4AF37] to-[#E1AD01] text-[#101322] shadow-xl shadow-[#D4AF37]/20">
                        <h4 className="text-lg font-black leading-tight mb-1 italic">Passez au niveau supérieur</h4>
                        <p className="text-xs font-bold opacity-80 mb-4">Voyez instantanément qui vous a liké et matchez immédiatement.</p>
                        <Link href={route('credits')} className="inline-flex w-full items-center justify-center h-12 rounded-xl bg-[#101322] text-white text-xs font-black uppercase tracking-widest active:scale-95 transition-transform">
                            Devenir Premium
                        </Link>
                    </div>
                )}
            </main>

            <NavigationBar />
        </div>
    );
}
