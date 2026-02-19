import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';
import { useCache } from '../contexts/CacheContext';

export default function Explorer() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [profiles, setProfiles] = useState([]);
    const [intentions, setIntentions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Initial Filters from URL or defaults
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        age_min: parseInt(searchParams.get('age_min')) || 18,
        age_max: parseInt(searchParams.get('age_max')) || 60,
        distance: parseInt(searchParams.get('distance')) || 50,
        gender: searchParams.get('gender') || '',
        intention_id: searchParams.get('intention_id') || ''
    });

    // const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

    const { getCachedData, setCachedData } = useCache();

    // Unified Effect: Handles Debounce AND Fetching
    useEffect(() => {
        const fetchExplorerData = async (searchTerm) => {
            // Create a unique cache key based on filters using the provided search term
            const currentParams = {
                s: searchTerm,
                amin: filters.age_min,
                amax: filters.age_max,
                d: filters.distance,
                g: filters.gender,
                i: filters.intention_id
            };
            
            const cacheKey = `explorer_${JSON.stringify(currentParams)}`;

            // Check Cache first
            const cached = getCachedData(cacheKey);
            if (cached) {
                console.log("Serving from cache:", cacheKey);
                setProfiles(cached.profiles);
                setIntentions(cached.intentions || []);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);
                if (filters.age_min !== 18) params.append('age_min', filters.age_min);
                if (filters.age_max !== 60) params.append('age_max', filters.age_max);
                if (filters.distance !== 50) params.append('distance', filters.distance);
                if (filters.gender) params.append('gender', filters.gender);
                if (filters.intention_id) params.append('intention_id', filters.intention_id);

                setSearchParams(params, { replace: true });

                const response = await axios.get(`/explorer?${params.toString()}`);
                const data = response.data;

                setProfiles(data.profiles || []);
                if (data.intentions) {
                    setIntentions(data.intentions);
                }

                setCachedData(cacheKey, {
                    profiles: data.profiles || [],
                    intentions: data.intentions || []
                }, 300);

            } catch (error) {
                console.error("Error fetching explorer data:", error);
            } finally {
                setLoading(false);
            }
        };

        // If search changed, debounce it
        const timer = setTimeout(() => {
            fetchExplorerData(filters.search);
        }, 500);

        return () => clearTimeout(timer);
    }, [filters.search, filters.age_min, filters.age_max, filters.distance, filters.gender, filters.intention_id, getCachedData, setCachedData, setSearchParams]);

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    };

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        setShowFilters(false);
        // Effect will trigger fetch
    };

    const categories = [
        { label: 'Entrepreneur', icon: 'work' },
        { label: 'Artiste', icon: 'palette' },
        { label: 'Nightlife', icon: 'nightlife' },
        { label: 'Voyage', icon: 'flight' }
    ];

    return (
        <div className="flex min-h-screen w-full flex-col bg-gray-50 dark:bg-[#101322] font-['Be_Vietnam_Pro'] text-[#101322] dark:text-white overflow-x-hidden transition-colors duration-500">
            {/* Header / Search */}
            <header className="flex flex-col bg-white dark:bg-[#101322] p-4 pb-6 sticky top-0 z-40 border-b border-black/5 dark:border-white/10 gap-4 transition-colors duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight uppercase italic text-[#D4AF37]">Explorer</h1>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Trouvez votre perle rare</p>
                    </div>
                    <Link to="/profile" className="size-10 rounded-2xl bg-gray-100 dark:bg-[#1a1f35] flex items-center justify-center border border-black/5 dark:border-white/10 overflow-hidden shadow-lg shadow-black/5 dark:shadow-black/20 transition-colors duration-500">
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">person</span>
                    </Link>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[#D4AF37] transition-colors">search</span>
                        </div>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={handleSearchChange}
                            placeholder="Nom, intérêt, ville..."
                            className="block w-full py-4 pl-12 pr-4 text-sm bg-gray-100 dark:bg-[#1a1f35] border border-black/5 dark:border-white/10 rounded-2xl focus:ring-1 focus:ring-[#D4AF37] text-[#101322] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(true)}
                        className={`size-14 rounded-2xl border flex items-center justify-center transition-all ${showFilters || Object.values(filters).some(v => v !== '' && v !== 18 && v !== 60 && v !== 50) ? 'bg-[#D4AF37] border-[#D4AF37] text-[#101322]' : 'bg-gray-100 dark:bg-[#1a1f35] border-black/5 dark:border-white/10 text-[#101322] dark:text-white'}`}
                    >
                        <span className="material-symbols-outlined">tune</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 space-y-10 pb-32">
                {/* suggested categories */}
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-gray-500">Recherches populaires</h3>
                    <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-3 pb-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.label}
                                onClick={() => updateFilter('search', cat.label)}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-[#1a1f35] border border-black/5 dark:border-white/10 whitespace-nowrap active:scale-95 transition-all hover:border-[#D4AF37]/30 shadow-sm dark:shadow-none transition-colors duration-500"
                            >
                                <span className="material-symbols-outlined text-sm text-[#D4AF37]">{cat.icon}</span>
                                <span className="text-[11px] font-black uppercase tracking-widest text-[#101322] dark:text-white">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Profiles Grid */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black uppercase tracking-tighter italic">
                            {filters.search ? `Résultats pour "${filters.search}"` : 'Profils à proximité'}
                        </h3>
                        {profiles.length > 0 && (
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{profiles.length} Profils</span>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 gap-4 animate-pulse">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-[3/4] rounded-[2rem] bg-white/5 border border-white/10" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <AnimatePresence>
                                {profiles.map((profile, index) => (
                                    <motion.div
                                        key={profile.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            to={`/profile/${profile.id}`}
                                            className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-white dark:bg-[#1a1f35] shadow-xl dark:shadow-2xl transition-transform active:scale-95 flex flex-col border border-black/5 dark:border-white/5 transition-colors duration-500"
                                        >
                                            <img
                                                src={profile.avatar || 'https://via.placeholder.com/400x600'}
                                                alt={profile.name}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

                                            <div className="absolute bottom-4 left-4 right-4">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="text-sm font-black truncate text-white">{profile.name}{profile.age ? `, ${profile.age}` : ''}</h4>
                                                    <div className="flex items-center gap-1">
                                                        {profile.is_verified && (
                                                            <span className="material-symbols-outlined text-[#D4AF37] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                navigate(`/chat/${profile.id}`);
                                                            }}
                                                            className="size-8 rounded-full bg-[#D4AF37] text-[#101322] flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">chat</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 opacity-80 text-white">
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px] text-[#D4AF37]">location_on</span>
                                                        <span className="text-[9px] font-bold uppercase tracking-wider">{profile.city || 'Cotonou'}</span>
                                                    </div>
                                                    {profile.distance_km !== undefined && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[12px] text-gray-400">near_me</span>
                                                            <span className="text-[9px] font-bold text-gray-400">À {profile.distance_km} km</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                {profile.intention && (
                                                    <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter shadow-lg border border-white/10`}
                                                        style={{ backgroundColor: `${profile.intention.color_badge || '#D4AF37'}EE`, color: '#fff' }}>
                                                        {profile.intention.label}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {!loading && profiles.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="size-20 rounded-full bg-gray-100 dark:bg-[#1a1f35] flex items-center justify-center mb-6 border border-black/5 dark:border-white/5 transition-colors duration-500">
                                <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-700">person_search</span>
                            </div>
                            <h4 className="text-lg font-black uppercase tracking-tighter italic mb-2">Aucun résultat</h4>
                            <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
                                Essayez d'élargir vos filtres de recherche ou changez votre localisation.
                            </p>
                            <button
                                onClick={() => setFilters({
                                    search: '',
                                    age_min: 18,
                                    age_max: 60,
                                    distance: 50,
                                    gender: '',
                                    intention_id: ''
                                })}
                                className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] underline decoration-2 underline-offset-4"
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    )}
                </section>
            </main>

            {/* Filter Modal */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 flex items-end"
                        onClick={() => setShowFilters(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full bg-white dark:bg-[#161a2e] border-t border-black/5 dark:border-white/10 rounded-t-[3rem] p-8 space-y-8 max-h-[90vh] overflow-y-auto transition-colors duration-500"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between font-black uppercase italic italic tracking-tighter">
                                <h2 className="text-2xl text-[#D4AF37]">Filtres</h2>
                                <button onClick={() => setShowFilters(false)} className="size-10 flex items-center justify-center bg-gray-100 dark:bg-white/5 text-[#101322] dark:text-white rounded-full transition-colors duration-500">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Gender */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Je cherche</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Homme', 'Femme', ''].map((g) => (
                                        <button
                                            key={g}
                                            onClick={() => updateFilter('gender', g)}
                                            className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${filters.gender === g ? 'bg-[#D4AF37] text-[#101322] border-[#D4AF37]' : 'bg-gray-50 dark:bg-[#1a1f35] border-black/5 dark:border-white/5 text-gray-500 dark:text-gray-400'}`}
                                        >
                                            {g || 'Peu importe'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Age Range */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Tranche d'âge</label>
                                    <span className="text-xs font-black text-[#D4AF37]">{filters.age_min} - {filters.age_max} ans</span>
                                </div>
                                <div className="space-y-4">
                                    <input
                                        type="range" min="18" max="60" value={filters.age_min}
                                        onChange={e => updateFilter('age_min', parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-gray-100 dark:bg-[#1a1f35] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                                    />
                                    <input
                                        type="range" min="18" max="60" value={filters.age_max}
                                        onChange={e => updateFilter('age_max', Math.max(filters.age_min + 1, parseInt(e.target.value)))}
                                        className="w-full h-1.5 bg-gray-100 dark:bg-[#1a1f35] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                                    />
                                </div>
                            </div>

                            {/* Distance */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Distance Maximale</label>
                                    <span className="text-xs font-black text-[#D4AF37]">{filters.distance} km</span>
                                </div>
                                <input
                                    type="range" min="5" max="200" step="5" value={filters.distance}
                                    onChange={e => updateFilter('distance', parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-100 dark:bg-[#1a1f35] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                                />
                            </div>

                            {/* Intention */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Intention</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => updateFilter('intention_id', '')}
                                        className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${filters.intention_id === '' ? 'bg-[#D4AF37] text-[#101322] border-[#D4AF37]' : 'bg-gray-50 dark:bg-[#1a1f35] border-black/5 dark:border-white/5 text-gray-500 dark:text-gray-400'}`}
                                    >
                                        Toutes
                                    </button>
                                    {intentions.map(int => (
                                        <button
                                            key={int.id}
                                            onClick={() => updateFilter('intention_id', int.id.toString())}
                                            className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${filters.intention_id == int.id ? 'bg-[#D4AF37] text-[#101322] border-[#D4AF37]' : 'bg-gray-50 dark:bg-[#1a1f35] border-black/5 dark:border-white/5 text-gray-500 dark:text-gray-400'}`}
                                        >
                                            {int.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={applyFilters}
                                className="w-full py-5 bg-[#D4AF37] text-[#101322] rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#D4AF37]/20 active:scale-95 transition-all"
                            >
                                Appliquer les filtres
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
