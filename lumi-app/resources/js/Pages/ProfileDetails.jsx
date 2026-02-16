import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react'; // Added usePage
import { motion, AnimatePresence } from 'framer-motion';
import NavigationBar from '@/Components/NavigationBar';

export default function ProfileDetails({ profile, isMutual }) {
    const { auth } = usePage().props;
    const isOwnProfile = auth.user && auth.user.id === profile.id;
    const [isBlurEnabled, setIsBlurEnabled] = useState(!isOwnProfile && profile.blur_enabled && !isMutual);
    const [activePhoto, setActivePhoto] = useState(0);

    const age = profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : '24';

    // Mock gallery if photos are missing
    const photos = profile.photos?.length > 0 ? profile.photos : [
        { url: profile.avatar || 'https://via.placeholder.com/800x1200' },
        { url: 'https://via.placeholder.com/800x1200' }
    ];

    const attributes = [
        { label: 'Métier', value: profile.job || 'Non spécifié', icon: 'work' },
        { label: 'Études', value: profile.education || 'Non spécifié', icon: 'school' },
        { label: 'Taille', value: profile.height ? `${profile.height} cm` : 'Non spécifié', icon: 'straighten' },
        { label: 'Ville', value: profile.city || 'Cotonou', icon: 'location_on' },
    ];

    return (
        <div className="min-h-screen bg-[#101322] text-white font-sans pb-32 overflow-x-hidden">
            <Head title={`${profile.name} - Profil`} />

            {/* Sticky Header */}
            <header className="fixed top-0 inset-x-0 h-16 bg-[#101322]/80 backdrop-blur-xl z-50 flex items-center justify-between px-6 border-b border-white/5">
                <button onClick={() => window.history.back()} className="size-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 active:scale-90 transition-transform">
                    <span className="material-symbols-outlined text-gray-400">arrow_back</span>
                </button>
                <div className="flex items-center gap-2 bg-[#D4AF37]/10 px-3 py-1.5 rounded-full border border-[#D4AF37]/20">
                    <span className="material-symbols-outlined text-[#D4AF37] text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">Certifié</span>
                </div>
                <button className="size-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 active:scale-90 transition-transform">
                    <span className="material-symbols-outlined text-gray-400">more_vert</span>
                </button>
            </header>

            {/* Hero Gallery Section */}
            <section className="relative h-[65vh] w-full bg-[#12151c]">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={activePhoto}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        src={photos[activePhoto].url}
                        className={`w-full h-full object-cover transition-all duration-700 ${isBlurEnabled ? 'blur-3xl scale-110' : ''}`}
                        alt={profile.name}
                    />
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="absolute top-20 inset-x-6 flex gap-1.5 z-10">
                    {photos.map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white"
                                initial={{ width: 0 }}
                                animate={{ width: idx <= activePhoto ? '100%' : '0%' }}
                            />
                        </div>
                    ))}
                </div>

                {/* Tap Areas */}
                <div className="absolute inset-0 flex z-20 top-20">
                    <div className="w-1/2 h-full" onClick={() => setActivePhoto(prev => Math.max(0, prev - 1))} />
                    <div className="w-1/2 h-full" onClick={() => setActivePhoto(prev => Math.min(photos.length - 1, prev + 1))} />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#101322] via-transparent to-black/20 pointer-events-none" />

                {/* Verification/Badge Overlay */}
                <div className="absolute bottom-10 left-6 z-30">
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-[2rem] shadow-2xl">
                        <div className="size-12 rounded-full bg-[#0f2cbd] flex items-center justify-center shadow-lg shadow-[#0f2cbd]/20">
                            <span className="material-symbols-outlined text-white text-2xl">{profile.intention?.icon || 'favorite'}</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter leading-none">Intention</p>
                            <p className="text-sm font-black italic text-[#D4AF37] uppercase">{profile.intention?.label || 'Sérieux'}</p>
                        </div>
                    </div>
                </div>

                {/* Blur Premium Message */}
                {isBlurEnabled && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-40 p-10 text-center">
                        <div className="size-20 bg-[#D4AF37] rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-[#D4AF37]/30">
                            <span className="material-symbols-outlined text-[#101322] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tighter mb-2">Visage Caché</h3>
                        <p className="text-xs font-medium text-gray-300 max-w-[200px] leading-relaxed mx-auto">
                            {profile.name} utilise le **Mode Fantôme**. Matchez pour débloquer ses photos.
                        </p>
                        <button onClick={() => setIsBlurEnabled(false)} className="mt-8 px-8 py-3 rounded-full bg-white text-[#101322] text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">
                            Tenter le match
                        </button>
                    </div>
                )}
            </section>

            {/* Profile Content */}
            <main className="px-6 py-4 space-y-10 relative z-30 -mt-6">
                {/* Header Info */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter">{profile.name}, {age}</h1>
                        <div className="flex items-center gap-1.5 text-gray-400 mt-1">
                            <span className="material-symbols-outlined text-sm text-[#D4AF37]">location_on</span>
                            <span className="text-xs font-bold uppercase tracking-widest">{profile.city || 'Cotonou'} • 5km</span>
                        </div>
                    </div>
                    <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-black text-[#D4AF37]">98%</span>
                    </div>
                </div>

                {/* Stats/Attributes Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {attributes.map((attr, idx) => (
                        <div key={idx} className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#D4AF37] opacity-50">{attr.icon}</span>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter leading-none">{attr.label}</p>
                                <p className="text-xs font-bold truncate text-gray-200">{attr.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bio Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="h-px flex-1 bg-white/10" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">À propos</h3>
                        <span className="h-px flex-1 bg-white/10" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-gray-300 italic text-center px-4">
                        "{profile.bio || 'Cet utilisateur n\'a pas encore rédigé de bio.'}"
                    </p>
                </section>

                {/* Interests Section */}
                <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Mes centres d'intérêt</h3>
                    <div className="flex flex-wrap gap-2">
                        {(profile.interests || ['Sport', 'Voyage', 'Cuisine']).map((interest, i) => (
                            <span key={i} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold text-gray-200 hover:border-[#D4AF37]/40 transition-colors">
                                {interest}
                            </span>
                        ))}
                    </div>
                </section>

                {/* Bottom Spacer for fixed actions */}
                <div className="h-20" />
            </main>

            {/* Sticky Action Footer */}
            {/* Sticky Action Footer */}
            <footer className="fixed bottom-8 inset-x-6 z-50">
                {isOwnProfile ? (
                    <div className="bg-[#101322]/80 backdrop-blur-2xl border border-white/10 p-3 rounded-[2.5rem] flex items-center gap-3 shadow-2xl">
                        <Link href={route('profile.edit')} className="flex-1 h-16 rounded-3xl bg-[#D4AF37] text-[#101322] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-2xl">edit</span>
                            <span className="text-[11px] font-black uppercase tracking-widest">Modifier</span>
                        </Link>
                        <button className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all hover:bg-white/10">
                            <span className="material-symbols-outlined text-3xl">settings</span>
                        </button>
                    </div>
                ) : (
                    <div className="bg-[#101322]/80 backdrop-blur-2xl border border-white/10 p-3 rounded-[2.5rem] flex items-center gap-3 shadow-2xl">
                        <button className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 active:scale-90 transition-all hover:bg-red-500/10 hover:border-red-500/20">
                            <span className="material-symbols-outlined text-3xl">close</span>
                        </button>
                        <button className="flex-1 h-16 rounded-3xl bg-white text-[#101322] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                            <span className="text-[11px] font-black uppercase tracking-widest">Lumi Match</span>
                        </button>
                    </div>
                )}
            </footer>
        </div>
    );
}
