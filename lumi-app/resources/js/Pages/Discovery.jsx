import React, { useState, useEffect } from 'react';
import { Head, router, Deferred } from '@inertiajs/react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

export default function Discovery({ initialProfiles }) {
    const [profiles, setProfiles] = useState(initialProfiles || []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dragDirection, setDragDirection] = useState(null);

    // Update profiles when initialProfiles arrives (deferred)
    useEffect(() => {
        if (initialProfiles && initialProfiles.length > 0) {
            setProfiles(initialProfiles);
        }
    }, [initialProfiles]);

    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-10, 10]);
    const opacityLike = useTransform(x, [50, 150], [0, 1]);
    const opacityNope = useTransform(x, [-150, -50], [1, 0]);

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 100) {
            setDragDirection('right');
            handleSwipe('liked');
        } else if (info.offset.x < -100) {
            setDragDirection('left');
            handleSwipe('passed');
        } else {
            x.set(0);
        }
    };

    const handleSwipe = async (status) => {
        if (currentIndex >= profiles.length) return;
        const target = profiles[currentIndex];

        try {
            const response = await window.axios.post('/api/swipe', {
                target_id: target.id,
                status: status === 'liked' ? 'liked' : 'passed'
            });
            const data = response.data;

            if (data.is_mutual) {
                // Route name check: match.success usually takes params
                router.get(route('match.success', { user2: target.id }));
            }

            x.set(0);
            setCurrentIndex((prev) => prev + 1);
        } catch (err) {
            console.error("Swipe error:", err);
            x.set(0);
            setCurrentIndex((prev) => prev + 1);
        }
    };

    return (
        <div className="min-h-screen bg-[#101322] font-['Be_Vietnam_Pro'] text-white transition-colors duration-300 flex flex-col relative overflow-hidden">
            <Head>
                <title>Lumi - Découverte</title>
            </Head>

            {/* Benin Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(#D4AF37 0.5px, transparent 0.5px)',
                    backgroundSize: '24px 24px'
                }}>
            </div>

            {/* TopAppBar */}
            <header className="flex items-center bg-[#101322] p-4 pb-2 justify-between sticky top-0 z-20 border-b border-white/10">
                <div className="flex size-12 items-center justify-start">
                    {/* Preferences button removed as per user request */}
                </div>
                <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center italic uppercase tracking-tighter">Découverte</h2>
                <div className="flex w-12 items-center justify-end">
                    <button onClick={() => router.visit('/notifications')} className="flex cursor-pointer items-center justify-center rounded-full h-12 bg-transparent text-white hover:text-[#D4AF37] transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                </div>
            </header>

            {/* Main Swipe Deck Area */}
            <main className="flex-1 relative p-4 flex flex-col items-center justify-center mb-24">
                <Deferred data="initialProfiles" fallback={
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="w-64 h-[400px] rounded-3xl bg-white/5 animate-pulse flex items-center justify-center border border-white/10">
                            <span className="material-symbols-outlined text-4xl text-white/20 animate-spin">loading</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">Recherche de profils...</p>
                    </div>
                }>
                    {profiles.length > 0 && currentIndex < profiles.length ? (
                        <div className="relative w-full h-[600px] flex items-center justify-center">
                            <AnimatePresence>
                                {profiles.map((profile, index) => (
                                    index === currentIndex && (
                                        <motion.div
                                            key={profile.id}
                                            className="absolute w-full h-full cursor-grab active:cursor-grabbing"
                                            style={{ x, rotate, zIndex: profiles.length - index }}
                                            drag="x"
                                            dragConstraints={{ left: 0, right: 0 }}
                                            onDragEnd={handleDragEnd}
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ x: dragDirection === 'right' ? 1000 : -1000, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            onClick={() => router.visit(`/profile/${profile.id}`)}
                                        >
                                            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-[#161b2e]">
                                                <div
                                                    className="absolute inset-0 bg-center bg-cover transition-transform duration-700 hover:scale-105"
                                                    style={{ backgroundImage: `url(${profile.avatar || 'https://via.placeholder.com/600'})` }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                                {/* Badge: Intention */}
                                                <div className="absolute top-4 right-4">
                                                    <div className="flex h-8 items-center justify-center gap-x-1.5 rounded-full bg-[#D4AF37] px-4 text-white shadow-lg border border-white/10">
                                                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                            {profile.intention?.icon || 'ring_volume'}
                                                        </span>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider">{profile.intention?.label || 'Sérieux'}</p>
                                                    </div>
                                                </div>

                                                {/* Profile Info */}
                                                <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                                                    <div className="flex items-baseline gap-2 mb-1">
                                                        <h1 className="text-3xl font-bold tracking-tight">{profile.name}, {profile.age || 25}</h1>
                                                        <span className="material-symbols-outlined text-[#D4AF37] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 opacity-90 mb-4 text-sm font-medium">
                                                        <span className="material-symbols-outlined text-[18px] text-[#D4AF37]">location_on</span>
                                                        <p>{profile.city || 'Cotonou'}, Bénin</p>
                                                    </div>

                                                    {/* Attributes Chips */}
                                                    <div className="flex gap-2 flex-wrap">
                                                        <div className="flex h-7 items-center justify-center gap-x-1 rounded-full bg-[#1a1f35] px-3 border border-white/10">
                                                            <span className="material-symbols-outlined text-[16px] text-[#D4AF37]">business_center</span>
                                                            <p className="text-[10px] font-medium uppercase tracking-wider">{profile.job || 'Indépendant'}</p>
                                                        </div>
                                                        <div className="flex h-7 items-center justify-center gap-x-1 rounded-full bg-[#1a1f35] px-3 border border-white/10">
                                                            <span className="material-symbols-outlined text-[16px] text-[#D4AF37]">height</span>
                                                            <p className="text-[10px] font-medium uppercase tracking-wider">{profile.height || '175'} cm</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                ))}
                            </AnimatePresence>

                            {/* Swipe Indicators */}
                            <motion.div style={{ opacity: opacityLike }} className="absolute top-20 right-10 z-50 pointer-events-none">
                                <div className="border-4 border-[#D4AF37] text-[#D4AF37] px-6 py-2 rounded-xl font-black text-4xl uppercase tracking-tighter rotate-12 bg-black/40">Like</div>
                            </motion.div>
                            <motion.div style={{ opacity: opacityNope }} className="absolute top-20 left-10 z-50 pointer-events-none">
                                <div className="border-4 border-red-500 text-red-500 px-6 py-2 rounded-xl font-black text-4xl uppercase tracking-tighter -rotate-12 bg-black/40">Suivant</div>
                            </motion.div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-8 space-y-6">
                            <div className="w-24 h-24 rounded-full bg-[#161b2e] flex items-center justify-center border border-white/10 shadow-inner">
                                <span className="material-symbols-outlined text-4xl text-[#D4AF37] animate-pulse">radar</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Plus de profils à proximité</h3>
                                <p className="text-gray-400 text-sm max-w-xs mx-auto">Revenez plus tard ou élargissez vos critères de recherche pour découvrir de nouvelles personnes.</p>
                            </div>
                            <button onClick={() => setCurrentIndex(0)} className="px-8 py-3 bg-[#D4AF37] text-white rounded-full font-bold text-sm uppercase tracking-widest shadow-lg shadow-[#D4AF37]/20 transition-transform active:scale-95">
                                Recharger les profils
                            </button>
                        </div>
                    )}

                    {/* Bottom Controls */}
                    {profiles.length > currentIndex && (
                        <div className="flex w-full justify-center gap-6 pt-8 items-center">
                            <button
                                onClick={() => handleSwipe('passed')}
                                className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-[#1a1f35] text-red-500 shadow-xl transition-all active:scale-90 border border-white/10 hover:bg-white/5"
                            >
                                <span className="material-symbols-outlined text-2xl font-bold">close</span>
                            </button>
                            <button
                                onClick={() => router.visit(`/chat/${profiles[currentIndex].id}`)}
                                className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-[#1a1f35] text-[#D4AF37] shadow-xl shadow-black/40 transition-all active:scale-90 border-2 border-[#D4AF37]/50 hover:bg-[#D4AF37]/10"
                            >
                                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 0" }}>chat</span>
                            </button>
                            <button
                                onClick={() => handleSwipe('liked')}
                                className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-[#D4AF37] text-[#101322] shadow-xl shadow-[#D4AF37]/30 transition-all active:scale-90 hover:scale-105"
                            >
                                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                            </button>
                        </div>
                    )}
                </Deferred>
            </main>
        </div>
    );
}
