import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function MatchSuccess({ user1, user2 }) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#101322] font-sans text-white p-8 overflow-hidden">
            <Head title="C'est un Match !" />

            {/* Background elements (Animated) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-20 -left-20 size-80 bg-[#D4AF37]/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
                    transition={{ duration: 12, repeat: Infinity }}
                    className="absolute -bottom-20 -right-20 size-80 bg-[#0f2cbd]/10 rounded-full blur-3xl"
                />
            </div>

            {/* Celebration Content */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 text-center"
            >
                <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[#D4AF37] font-black uppercase tracking-[0.3em] text-sm mb-4 block"
                >
                    Félicitations !
                </motion.span>

                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none mb-12">
                    C'EST UN <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#D4AF37] to-white">MATCH !</span>
                </h1>

                {/* Avatars with matching animation */}
                <div className="flex items-center justify-center -space-x-8 mb-16 px-10">
                    <motion.div
                        initial={{ x: -100, rotate: -20, opacity: 0 }}
                        animate={{ x: 0, rotate: -10, opacity: 1 }}
                        transition={{ type: 'spring', damping: 12 }}
                        className="relative z-10 size-32 md:size-40 rounded-[2.5rem] border-4 border-[#101322] shadow-2xl overflow-hidden"
                    >
                        <img src={user1?.avatar || 'https://via.placeholder.com/400'} alt="Vous" className="w-full h-full object-cover" />
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="relative z-20 size-16 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-2xl shadow-[#D4AF37]/40"
                    >
                        <span className="material-symbols-outlined text-[#101322] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </motion.div>

                    <motion.div
                        initial={{ x: 100, rotate: 20, opacity: 0 }}
                        animate={{ x: 0, rotate: 10, opacity: 1 }}
                        transition={{ type: 'spring', damping: 12 }}
                        className="relative z-10 size-32 md:size-40 rounded-[2.5rem] border-4 border-[#101322] shadow-2xl overflow-hidden"
                    >
                        <img src={user2?.avatar || 'https://via.placeholder.com/400'} alt="Match" className="w-full h-full object-cover" />
                    </motion.div>
                </div>

                <p className="text-gray-400 text-sm font-medium mb-12 max-w-xs mx-auto">
                    Vous et <strong>{user2?.name || 'votre match'}</strong> vous plaisez mutuellement !
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                    <Link
                        href={route('chat.show', user2?.id || 1)}
                        className="flex h-16 items-center justify-center rounded-2xl bg-white text-[#101322] font-black uppercase tracking-widest text-xs shadow-xl shadow-white/5 active:scale-95 transition-all"
                    >
                        Envoyer un message
                    </Link>
                    <Link
                        href={route('discovery')}
                        className="flex h-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
                    >
                        Continuer à swiper
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
