import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../api/axios';
import { useCache } from '../contexts/CacheContext';

export default function ProfileViews() {
    const navigate = useNavigate();
    const [views, setViews] = useState([]);
    const [loading, setLoading] = useState(true);

    const { getCachedData, setCachedData } = useCache();
    const CACHE_KEY = 'profile_views';

    useEffect(() => {
        const controller = new AbortController();
        fetchViews(controller.signal);
        return () => controller.abort();
    }, []);

    const fetchViews = async (signal) => {
        const cached = getCachedData(CACHE_KEY);
        if (cached) {
            setViews(cached);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get('/profile/views', { signal });
            const data = response.data.views || [];
            setViews(data);
            setCachedData(CACHE_KEY, data, 120);
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error("Error fetching profile views:", error);
            }
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    };

    const timeAgo = (dateString) => {
        const diffMs = Date.now() - new Date(dateString).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return "à l'instant";
        if (mins < 60) return `il y a ${mins} min`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `il y a ${hours} h`;
        const days = Math.floor(hours / 24);
        return `il y a ${days} j`;
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-gray-50 dark:bg-[#101322] font-['Be_Vietnam_Pro'] text-[#101322] dark:text-white transition-colors duration-500">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white dark:bg-[#101322] border-b border-black/5 dark:border-white/10 px-6 py-4 transition-colors duration-500">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-[#1a1f35] active:bg-gray-200 dark:active:bg-white/10 transition-all">
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-black tracking-tight uppercase italic text-[#101322] dark:text-white transition-colors duration-500">Qui a vu mon profil</h1>
                </div>
            </header>

            <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 pb-32">
                {loading ? (
                    <div className="grid grid-cols-2 gap-4 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[3/4] rounded-[2rem] bg-white/5 border border-white/10" />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {views.map((view) => (
                            <Link
                                key={view.id}
                                to={`/profile/${view.user?.id}`}
                                className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-black/5 dark:border-white/10 shadow-xl dark:shadow-2xl transition-all active:scale-95 bg-white dark:bg-[#161b2e] transition-colors duration-500"
                            >
                                <div className="absolute inset-0">
                                    <img
                                        src={view.user?.avatar || 'https://via.placeholder.com/400x600'}
                                        alt={view.user?.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#101322] via-transparent to-transparent opacity-90" />
                                </div>

                                <div className="absolute bottom-4 left-4 right-4 text-center">
                                    <div className="flex flex-col items-center gap-1 mb-1">
                                        <h3 className="text-xs font-black uppercase tracking-tighter italic truncate w-full text-white">
                                            {view.user?.name || 'Utilisateur Lumi'}
                                        </h3>
                                        {view.user?.is_verified && (
                                            <span className="material-symbols-outlined text-[#D4AF37] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                        )}
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/60">
                                        {timeAgo(view.viewed_at)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </motion.div>
                )}

                {/* Empty State */}
                {!loading && views.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="size-20 bg-white dark:bg-[#161b2e] rounded-full flex items-center justify-center mb-6 border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-500">
                            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 transition-colors duration-500">visibility</span>
                        </div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 transition-colors duration-500">Aucune vue pour l'instant</p>
                        <p className="text-xs mt-3 text-gray-600 font-medium px-10 leading-relaxed italic">
                            Les personnes qui consultent votre profil apparaîtront ici.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
