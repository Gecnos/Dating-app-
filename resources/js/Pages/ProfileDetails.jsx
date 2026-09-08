import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthProvider';
import { useCache } from '../contexts/CacheContext';
import { useToast } from '../contexts/ToastContext';

export default function ProfileDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { success, error } = useToast();
    const { getCachedData, setCachedData } = useCache();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activePhoto, setActivePhoto] = useState(0);
    const [showPhotoPopup, setShowPhotoPopup] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    
    // Options actions
    const [reportModal, setReportModal] = useState(false);
    const [reportReason, setReportReason] = useState(null);
    const [reportDescription, setReportDescription] = useState('');
    const [blockConfirm, setBlockConfirm] = useState(false);

    const reportReasons = [
        "Faux profil / Spam",
        "Harcèlement / Insultes",
        "Contenu inapproprié",
        "Autre"
    ];

    const CACHE_KEY = `profile_details_${id}`;

    useEffect(() => {
        const controller = new AbortController();
        fetchProfile(controller.signal);
        return () => controller.abort();
    }, [id]);

    const fetchProfile = async (signal) => {
        const cached = getCachedData(CACHE_KEY);
        if (cached) {
            console.log(`Serving Profile ${id} from cache`);
            setProfile(cached);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`/user/${id}`, { signal });
            const data = response.data.user || response.data; // Handle wrapped or direct response
            setProfile(data);
            setCachedData(CACHE_KEY, data, 300); // 5 mins cache
        } catch (err) {
            if (axios.isCancel(err)) {
                 console.log('Request canceled');
            } else {
                 console.error(err);
                 error("Impossible de charger le profil.");
                 navigate('/discovery');
            }
        } finally {
             if (!signal?.aborted) {
                 setLoading(false);
             }
        }
    };

    const handleReport = async () => {
        if (!reportReason) return;
        try {
            await axios.post('/reports', {
                reported_id: profile.id,
                reason: reportReason,
                description: reportDescription
            });
            setShowOptions(false);
            setReportModal(false);
            success("Signalement envoyé. Le profil a été masqué.");
            navigate('/discovery');
        } catch (err) {
            console.error(err);
            error("Erreur lors du signalement.");
        }
    };

    const handleBlock = async () => {
        try {
            await axios.post('/blocks', { blocked_id: profile.id });
            setShowOptions(false);
            setBlockConfirm(false);
            success("Utilisateur bloqué.");
            navigate('/discovery');
        } catch (err) {
            console.error(err);
            error("Erreur lors du blocage.");
        }
    };

    const isOwnProfile = authUser && profile && authUser.id === profile.id;

    if (loading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#101322]">
                <div className="size-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Derived logic
    const age = profile.age || (profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : 25);
    const photos = profile.photos && profile.photos.length > 0 
        ? profile.photos 
        : [{ url: profile.avatar, id: 'avatar' }];

    const attributes = [
        { icon: 'business_center', label: 'Profession', value: profile.job || 'Non renseigné' },
        { icon: 'school', label: 'Études', value: profile.education || 'Non renseigné' },
        { icon: 'height', label: 'Taille', value: profile.height ? `${profile.height} cm` : 'Non renseigné' },
        { icon: 'translate', label: 'Langues', value: Array.isArray(profile.languages) ? profile.languages.join(', ') : (profile.languages || 'Français') },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] text-[#101322] dark:text-white font-['Be_Vietnam_Pro'] pb-32 overflow-x-hidden transition-colors duration-500">
            {/* Photo Enlargement Popup */}
            <AnimatePresence>
                {showPhotoPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPhotoPopup(false)}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                    >
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={photos[activePhoto].url}
                            className="max-w-full max-h-[80vh] rounded-3xl object-contain shadow-2xl"
                        />
                        <button className="absolute top-10 right-10 size-12 rounded-full bg-white/10 flex items-center justify-center">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Options Menu (Report/Block) */}
            <AnimatePresence>
                {showOptions && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowOptions(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative w-full max-w-md bg-white dark:bg-[#161b2e] rounded-t-[3rem] p-8 border-t border-black/5 dark:border-white/10 shadow-2xl transition-colors duration-500"
                        >
                            <div className="w-12 h-1 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-8" />
                            <h3 className="text-xl font-black italic tracking-tighter mb-6 text-center text-[#101322] dark:text-white transition-colors duration-500">Options du profil</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setReportModal(true)}
                                    className="w-full py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center gap-3 text-red-500 font-bold active:scale-95 transition-all transition-colors duration-500"
                                >
                                    <span className="material-symbols-outlined text-xl">report</span>
                                    Signaler le profil
                                </button>
                                <button
                                    onClick={() => setBlockConfirm(true)}
                                    className="w-full py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400 font-bold active:scale-95 transition-all transition-colors duration-500"
                                >
                                    <span className="material-symbols-outlined text-xl">block</span>
                                    Bloquer cet utilisateur
                                </button>
                                <button onClick={() => setShowOptions(false)} className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-sm font-black uppercase tracking-widest mt-4 text-[#101322] dark:text-white transition-colors duration-500">
                                    Annuler
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Report Reason Modal */}
                {reportModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-white dark:bg-[#161b2e] w-full max-w-sm rounded-[2.5rem] p-8 border border-black/5 dark:border-white/10 shadow-2xl transition-colors duration-500">
                            <h3 className="text-xl font-black italic tracking-tight mb-6 text-[#101322] dark:text-white transition-colors duration-500">Signaler {profile.name}</h3>
                            <div className="space-y-2 mb-6">
                                {reportReasons.map(reason => (
                                    <button
                                        key={reason}
                                        onClick={() => setReportReason(reason)}
                                        className={`w-full p-4 rounded-2xl text-xs font-bold text-left transition-all ${reportReason === reason ? 'bg-[#D4AF37] text-white dark:text-[#101322]' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'} transition-colors duration-500`}
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={reportDescription}
                                onChange={(e) => setReportDescription(e.target.value)}
                                placeholder="Détails supplémentaires (optionnel)..."
                                className="w-full bg-gray-50 dark:bg-white/5 border-black/5 dark:border-none rounded-2xl p-4 text-xs italic text-[#101322] dark:text-gray-300 mb-6 min-h-[100px] focus:ring-[#D4AF37] transition-colors duration-500"
                            ></textarea>
                            <div className="flex gap-3">
                                <button onClick={() => setReportModal(false)} className="flex-1 py-4 rounded-2xl bg-white/10 font-bold text-xs">Annuler</button>
                                <button onClick={handleReport} disabled={!reportReason} className="flex-1 py-4 rounded-2xl bg-red-500 font-black text-xs uppercase tracking-widest disabled:opacity-50">Confirmer</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Block Confirm Modal */}
                {blockConfirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-white dark:bg-[#161b2e] w-full max-w-sm rounded-[2.5rem] p-8 border border-black/5 dark:border-white/10 shadow-2xl text-center transition-colors duration-500">
                            <div className="size-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 transition-colors duration-500">
                                <span className="material-symbols-outlined text-4xl">block_flipped</span>
                            </div>
                            <h3 className="text-xl font-black italic tracking-tight mb-2 text-[#101322] dark:text-white transition-colors duration-500">Bloquer {profile.name} ?</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 leading-relaxed transition-colors duration-500">
                                Vous ne verrez plus ce profil et cet utilisateur ne pourra plus interagir avec vous.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setBlockConfirm(false)} className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-white/10 font-bold text-xs text-[#101322] dark:text-white transition-colors duration-500">Annuler</button>
                                <button onClick={handleBlock} className="flex-1 py-4 rounded-2xl bg-[#101322] dark:bg-white text-white dark:text-red-500 font-black text-xs uppercase tracking-widest transition-colors duration-500">Bloquer</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sticky Header */}
            <header className="fixed top-0 inset-x-0 h-16 bg-white/90 dark:bg-[#101322]/90 backdrop-blur-xl z-50 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/10 transition-all duration-500">
                <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-[#1a1f35] border border-black/5 dark:border-white/10 active:scale-90 transition-all transition-colors duration-500">
                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">arrow_back</span>
                </button>
                <div className="flex items-center gap-2 bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 px-3 py-1.5 rounded-full border border-[#D4AF37]/20 dark:border-[#D4AF37]/30 transition-colors duration-500">
                    <span className="material-symbols-outlined text-[#D4AF37] text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">Certifié</span>
                </div>
                {!isOwnProfile && (
                    <button onClick={() => setShowOptions(true)} className="size-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-[#1a1f35] border border-black/5 dark:border-white/10 active:scale-90 transition-all transition-colors duration-500">
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">more_vert</span>
                    </button>
                )}
                {isOwnProfile && <div className="size-10" />}
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
                        onClick={() => setShowPhotoPopup(true)} // Enlargement on click
                        className="w-full h-full object-cover transition-all duration-700 cursor-zoom-in"
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
                    <div className="flex items-center gap-3 bg-white/90 dark:bg-[#1a1f35]/90 backdrop-blur-xl border border-black/5 dark:border-white/10 p-4 rounded-[2rem] shadow-2xl transition-all duration-500">
                        <div className="size-12 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                            <span className="material-symbols-outlined text-white dark:text-[#101322] text-2xl transition-colors duration-500">{profile.intention?.icon || 'favorite'}</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-tighter leading-none transition-colors duration-500">Intention</p>
                            <p className="text-sm font-black italic text-[#D4AF37] uppercase">{profile.intention?.label || 'Sérieux'}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Profile Content */}
            <main className="px-6 py-4 space-y-10 relative z-30 -mt-6">
                {/* Header Info */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter text-[#101322] dark:text-white transition-colors duration-500">{profile.name}, {age} ans</h1>
                        <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 mt-1 transition-colors duration-500">
                            <span className="material-symbols-outlined text-sm text-[#D4AF37]">location_on</span>
                            <span className="text-xs font-bold uppercase tracking-widest">{profile.city || 'Cotonou'} • {profile.distance_km ? `${profile.distance_km}km` : 'À proximité'}</span>
                        </div>
                    </div>
                </div>

                {/* Stats/Attributes Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {attributes.map((attr, idx) => (
                        <div key={idx} className="p-4 rounded-3xl bg-white dark:bg-[#1a1f35] border border-black/5 dark:border-white/10 flex items-center gap-3 transition-colors duration-500 shadow-sm dark:shadow-none">
                            <span className="material-symbols-outlined text-[#D4AF37] opacity-60 text-xl">{attr.icon}</span>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter leading-none transition-colors duration-500">{attr.label}</p>
                                <p className="text-xs font-bold truncate text-[#101322] dark:text-gray-200 transition-colors duration-500">{attr.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bio Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="h-px flex-1 bg-black/5 dark:bg-white/10 transition-colors duration-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 transition-colors duration-500">À propos</h3>
                        <span className="h-px flex-1 bg-black/5 dark:bg-white/10 transition-colors duration-500" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-300 italic text-center px-4 transition-colors duration-500">
                        "{profile.bio || 'Cet utilisateur n\'a pas encore rédigé de bio.'}"
                    </p>
                </section>

                {/* Interests Section */}
                <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Mes centres d'intérêt</h3>
                    <div className="flex flex-wrap gap-2">
                        {(profile.interests || []).map((interest, i) => (
                            <span key={i} className="px-5 py-2.5 bg-white dark:bg-[#1a1f35] border border-black/5 dark:border-white/10 rounded-2xl text-[11px] font-bold text-gray-500 dark:text-gray-200 hover:border-[#D4AF37]/40 transition-colors duration-500 shadow-sm dark:shadow-none">
                                {typeof interest === 'string' ? interest : interest.label}
                            </span>
                        ))}
                    </div>
                </section>

                {/* Bottom Spacer for fixed actions */}
                <div className="h-20" />
            </main>

            {/* Sticky Action Footer */}
            <footer className="fixed bottom-8 inset-x-6 z-50">
                {isOwnProfile ? (
                    <div className="bg-[#101322]/80 backdrop-blur-2xl border border-white/10 p-3 rounded-[2.5rem] flex items-center gap-3 shadow-2xl">
                        <Link to="/profile/edit" className="flex-1 h-16 rounded-3xl bg-[#D4AF37] text-[#101322] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-2xl">edit</span>
                            <span className="text-[11px] font-black uppercase tracking-widest">Modifier</span>
                        </Link>
                        <Link to="/settings" className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all hover:bg-white/10">
                            <span className="material-symbols-outlined text-3xl">settings</span>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-[#101322]/80 backdrop-blur-2xl border border-white/10 p-3 rounded-[2.5rem] flex items-center gap-3 shadow-2xl">
                        <button onClick={() => navigate(-1)} className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 active:scale-90 transition-all hover:bg-red-500/10 hover:border-red-500/20">
                            <span className="material-symbols-outlined text-3xl">close</span>
                        </button>
                        <button onClick={() => navigate(`/chat/${profile.id}`)} className="flex-1 h-16 rounded-3xl bg-[#D4AF37] text-[#101322] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all text-white">
                            <span className="material-symbols-outlined text-2xl">chat</span>
                            <span className="text-[11px] font-black uppercase tracking-widest">Message</span>
                        </button>
                        <button className="size-16 rounded-3xl bg-white text-[#101322] flex items-center justify-center shadow-xl active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        </button>
                    </div>
                )}
            </footer>
        </div>
    );
}
