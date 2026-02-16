import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import NavigationBar from '@/Components/NavigationBar';
import { motion } from 'framer-motion';

export default function Explorer({ profiles, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('explorer'), { search }, { preserveState: true });
    };

    const categories = [
        { label: 'Entrepreneur', icon: 'work' },
        { label: 'Artiste', icon: 'palette' },
        { label: 'Nightlife', icon: 'nightlife' },
        { label: 'Cuisine', icon: 'restaurant' },
        { label: 'Voyage', icon: 'flight' }
    ];

    return (
        <div className="flex h-screen w-full flex-col bg-[#101322] font-sans text-white overflow-hidden">
            <Head title="Découverte" />

            {/* Header / Search */}
            <header className="flex flex-col bg-[#101322]/90 backdrop-blur-xl p-4 pb-6 sticky top-0 z-20 border-b border-white/5 gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black tracking-tight uppercase">Découverte</h1>
                    <Link href={route('profile', 'me')} className="size-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 overflow-hidden">
                        <span className="material-symbols-outlined text-gray-400">person</span>
                    </Link>
                </div>

                <form onSubmit={handleSearch} className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[#D4AF37] transition-colors">search</span>
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par nom ou intérêt..."
                        className="block w-full py-4 pl-12 pr-4 text-sm bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37] placeholder-gray-500 transition-all"
                    />
                </form>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
                {/* suggested categories */}
                <section>
                    <h3 className="text-lg font-black uppercase tracking-tighter mb-4">Recherches suggérées</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.label}
                                onClick={() => router.get(route('explorer'), { search: cat.label })}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 active:scale-95 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm text-[#D4AF37]">{cat.icon}</span>
                                <span className="text-xs font-bold uppercase tracking-wider">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Profiles Grid */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black uppercase tracking-tighter">Profils à proximité</h3>
                        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">Tout voir</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {profiles.map((profile) => (
                            <Link
                                key={profile.id}
                                href={route('profile', profile.id)}
                                className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-white/5 shadow-xl transition-transform active:scale-95"
                            >
                                <img
                                    src={profile.avatar || 'https://via.placeholder.com/400x600'}
                                    alt={profile.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                <div className="absolute bottom-3 left-3 right-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-sm font-bold truncate">{profile.name}, {25}</h4>
                                        {profile.is_verified && (
                                            <span className="material-symbols-outlined text-[#D4AF37] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-70">
                                        <span className="material-symbols-outlined text-[14px] text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{profile.city || 'Cotonou'}</span>
                                    </div>
                                </div>

                                {profile.is_new && (
                                    <div className="absolute top-3 left-3">
                                        <div className="px-2 py-0.5 rounded-lg bg-[#D4AF37] text-[9px] font-black text-[#101322] uppercase tracking-tighter shadow-lg">
                                            Nouveau
                                        </div>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>

                    {profiles.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                            <span className="material-symbols-outlined text-6xl mb-4">sentiment_dissatisfied</span>
                            <p className="text-sm font-bold uppercase tracking-widest">Aucun profil trouvé</p>
                            <p className="text-xs mt-2">Essayez une autre recherche ou filtre.</p>
                        </div>
                    )}
                </section>
            </main>

            <NavigationBar />
        </div>
    );
}
