import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import NavigationBar from '@/Components/NavigationBar';
import { motion, AnimatePresence } from 'framer-motion';

export default function Explorer({ profiles, filters, intentions }) {
    const [search, setSearch] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);

    // Instant search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(route('explorer'), {
                    ...filters,
                    search
                }, {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true
                });
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // Filter states
    const [ageMin, setAgeMin] = useState(filters.age_min || 18);
    const [ageMax, setAgeMax] = useState(filters.age_max || 60);
    const [distance, setDistance] = useState(filters.distance || 50);
    const [gender, setGender] = useState(filters.gender || '');
    const [intentionId, setIntentionId] = useState(filters.intention_id || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('explorer'), {
            ...filters,
            search
        }, { preserveState: true });
    };

    const applyFilters = () => {
        router.get(route('explorer'), {
            search,
            age_min: ageMin,
            age_max: ageMax,
            distance,
            gender,
            intention_id: intentionId
        }, { preserveState: true });
        setShowFilters(false);
    };

    const categories = [
        { label: 'Entrepreneur', icon: 'work' },
        { label: 'Artiste', icon: 'palette' },
        { label: 'Nightlife', icon: 'nightlife' },
        { label: 'Voyage', icon: 'flight' }
    ];

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#101322] font-sans text-white overflow-x-hidden">
            <Head title="Découverte" />

            {/* Header / Search */}
            <header className="flex flex-col bg-[#101322]/80 backdrop-blur-xl p-4 pb-6 sticky top-0 z-40 border-b border-white/5 gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight uppercase italic text-[#D4AF37]">Explorer</h1>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Trouvez votre perle rare</p>
                    </div>
                    <Link href={route('profile', 'me')} className="size-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden shadow-lg shadow-black/20">
                        <span className="material-symbols-outlined text-gray-400">person</span>
                    </Link>
                </div>

                <div className="flex gap-2">
                    <form onSubmit={handleSearch} className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[#D4AF37] transition-colors">search</span>
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Nom, intérêt, ville..."
                            className="block w-full py-4 pl-12 pr-4 text-sm bg-white/5 border border-white/5 rounded-2xl focus:ring-1 focus:ring-[#D4AF37] placeholder-gray-500 transition-all outline-none"
                        />
                    </form>
                    <button
                        onClick={() => setShowFilters(true)}
                        className={`size-14 rounded-2xl border flex items-center justify-center transition-all ${showFilters || Object.keys(filters).length > 1 ? 'bg-[#D4AF37] border-[#D4AF37] text-[#101322]' : 'bg-white/5 border-white/5 text-white'}`}
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
                                onClick={() => router.get(route('explorer'), { search: cat.label })}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/5 whitespace-nowrap active:scale-95 transition-all hover:border-[#D4AF37]/30"
                            >
                                <span className="material-symbols-outlined text-sm text-[#D4AF37]">{cat.icon}</span>
                                <span className="text-[11px] font-black uppercase tracking-widest">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Profiles Grid */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black uppercase tracking-tighter italic">
                            {search ? `Résultats pour "${search}"` : 'Profils à proximité'}
                        </h3>
                        {profiles.length > 0 && (
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{profiles.length} Profils</span>
                        )}
                    </div>

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
                                        href={route('profile', profile.id)}
                                        className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-white/5 shadow-2xl transition-transform active:scale-95 flex flex-col"
                                    >
                                        <img
                                            src={profile.avatar || 'https://via.placeholder.com/400x600'}
                                            alt={profile.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-sm font-black truncate">{profile.name}{profile.age ? `, ${profile.age}` : ''}</h4>
                                                {profile.is_verified && (
                                                    <span className="material-symbols-outlined text-[#D4AF37] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 opacity-80">
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
                                                <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter shadow-lg backdrop-blur-md border border-white/10`}
                                                    style={{ backgroundColor: `${profile.intention.color_badge || '#D4AF37'}CC`, color: '#fff' }}>
                                                    {profile.intention.label}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {profiles.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-4xl text-gray-700">person_search</span>
                            </div>
                            <h4 className="text-lg font-black uppercase tracking-tighter italic mb-2">Aucun résultat</h4>
                            <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
                                Essayez d'élargir vos filtres de recherche ou changez votre localisation.
                            </p>
                            <button
                                onClick={() => router.get(route('explorer'))}
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
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full bg-[#161a2e] border-t border-white/10 rounded-t-[3rem] p-8 space-y-8 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between font-black uppercase italic italic tracking-tighter">
                                <h2 className="text-2xl text-[#D4AF37]">Filtres</h2>
                                <button onClick={() => setShowFilters(false)} className="size-10 flex items-center justify-center bg-white/5 rounded-full">
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
                                            onClick={() => setGender(g)}
                                            className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${gender === g ? 'bg-[#D4AF37] text-[#101322] border-[#D4AF37]' : 'bg-white/5 border-white/5 text-gray-400'}`}
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
                                    <span className="text-xs font-black text-[#D4AF37]">{ageMin} - {ageMax} ans</span>
                                </div>
                                <div className="space-y-4">
                                    <input
                                        type="range" min="18" max="60" value={ageMin}
                                        onChange={e => setAgeMin(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                                    />
                                    <input
                                        type="range" min="18" max="60" value={ageMax}
                                        onChange={e => setAgeMax(Math.max(ageMin + 1, parseInt(e.target.value)))}
                                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                                    />
                                </div>
                            </div>

                            {/* Distance */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Distance Maximale</label>
                                    <span className="text-xs font-black text-[#D4AF37]">{distance} km</span>
                                </div>
                                <input
                                    type="range" min="5" max="200" step="5" value={distance}
                                    onChange={e => setDistance(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                                />
                            </div>

                            {/* Intention */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Intention</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setIntentionId('')}
                                        className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${intentionId === '' ? 'bg-[#D4AF37] text-[#101322] border-[#D4AF37]' : 'bg-white/5 border-white/5 text-gray-400'}`}
                                    >
                                        Toutes
                                    </button>
                                    {intentions.map(int => (
                                        <button
                                            key={int.id}
                                            onClick={() => setIntentionId(int.id)}
                                            className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${intentionId === int.id ? 'bg-[#D4AF37] text-[#101322] border-[#D4AF37]' : 'bg-white/5 border-white/5 text-gray-400'}`}
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

            <NavigationBar />
        </div>
    );
}
