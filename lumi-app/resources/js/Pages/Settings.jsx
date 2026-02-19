import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthProvider';
import { useCache } from '../contexts/CacheContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

export default function Settings() {
    const navigate = useNavigate();
    const { user: authUser, setUser: setAuthUser, logout } = useAuth();

    // Theme state
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) return saved === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return true;
    });

    const [ghostMode, setGhostMode] = useState(authUser?.is_ghost_mode || false);

    const [securityInfo, setSecurityInfo] = useState({
        masked_email: '',
        password_last_changed: 'Chargement...',
        can_change_password: false
    });

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const { getCachedData, setCachedData, clearCache } = useCache();
    const CACHE_KEY = 'settings_security_info';

    useEffect(() => {
        const controller = new AbortController();
        fetchSecurityInfo(controller.signal);
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const fetchSecurityInfo = async (signal) => {
        const cached = getCachedData(CACHE_KEY);
        if (cached) {
            setSecurityInfo(cached);
            // We might want to fetch fresh data in background to ensure "password_last_changed" is accurate
            // but for security info, typically it doesn't change *that* often during a session.
        }

        try {
            const res = await axios.get('/security/info', { signal });
            setSecurityInfo(res.data);
            setCachedData(CACHE_KEY, res.data, 300);
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error("Error fetching security info:", error);
            }
        }
    };

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const toggleGhostMode = async () => {
        const newValue = !ghostMode;
        setGhostMode(newValue);
        try {
            await axios.post('/user/ghost-mode');
            // Update auth context
            if (setAuthUser && authUser) {
                setAuthUser({ ...authUser, is_ghost_mode: newValue });
            }
        } catch (err) {
            setGhostMode(!newValue);
            console.error(err);
        }
    };

    const { success, error } = useToast();
    const { confirm } = useConfirm();

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await axios.post('/security/password', passwordData);
            setShowPasswordForm(false);
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });
            success('Mot de passe mis à jour !');
            clearCache(CACHE_KEY); // Force refresh
            fetchSecurityInfo();
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else if (err.response?.data?.message) {
                setErrors({ general: err.response.data.message });
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteAccount = () => {
        confirm({
            title: "Supprimer mon compte",
            message: "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
            isDangerous: true,
            confirmText: "Supprimer définitivement",
            onConfirm: async () => {
                try {
                    await axios.delete('/user/delete');
                    logout(); // Logout will redirect to login
                } catch (err) {
                    console.error("Error deleting account:", err);
                    error("Erreur lors de la suppression du compte.");
                }
            }
        });
    };

    if (!authUser) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] text-[#101322] dark:text-white font-['Be_Vietnam_Pro'] pb-32 overflow-x-hidden transition-colors duration-500">
            {/* Header */}
            <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b bg-white/90 dark:bg-[#101322]/90 border-black/5 dark:border-white/10 backdrop-blur-xl transition-all duration-500">
                <Link to="/profile" className="w-10 h-10 flex items-center justify-start">
                    <span className="material-symbols-outlined text-[#101322] dark:text-white transition-colors duration-500">arrow_back_ios</span>
                </Link>
                <h1 className="text-lg font-bold text-[#101322] dark:text-white transition-colors duration-500">Paramètres</h1>
                <div className="w-10" />
            </header>

            <main className="max-w-lg mx-auto p-6 space-y-8">
                {/* Account Section */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-2 transition-colors duration-500">Compte & Sécurité</h3>
                    <div className="rounded-3xl border bg-white dark:bg-[#161b2e] border-black/5 dark:border-white/5 shadow-sm divide-y divide-black/5 dark:divide-white/5 transition-colors duration-500">
                        <div className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors duration-500">
                                    <span className="material-symbols-outlined text-xl">alternate_email</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Email</p>
                                    <p className="text-[10px] text-gray-500">{securityInfo.masked_email || authUser.email}</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                        </div>
                        <button
                            onClick={() => setShowPasswordForm(true)}
                            className="w-full text-left p-5 flex items-center justify-between group active:bg-black/5 dark:active:bg-white/5 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 transition-colors duration-500">
                                    <span className="material-symbols-outlined text-xl">lock</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Changer le mot de passe</p>
                                    <p className="text-[9px] text-gray-500 italic">Mise à jour : {securityInfo.password_last_changed}</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </button>
                    </div>
                </section>

                {/* Privacy Management section */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-2 transition-colors duration-500">Confidentialité</h3>
                    <div className="rounded-3xl border bg-white dark:bg-[#161b2e] border-black/5 dark:border-white/5 shadow-sm divide-y divide-black/5 dark:divide-white/5 transition-colors duration-500">
                        <Link to="/settings/blocked" className="w-full text-left p-5 flex items-center justify-between group active:bg-black/5 dark:active:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors duration-500">
                                    <span className="material-symbols-outlined text-xl">block</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Utilisateurs bloqués</p>
                                    <p className="text-[9px] text-gray-500">Gérer les profils que vous avez bloqués</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </Link>
                        {/* Reports separate page or just link? For now assume placeholder or no page yet */}
                        <button className="w-full text-left p-5 flex items-center justify-between group active:bg-black/5 dark:active:bg-white/5 transition-colors cursor-not-allowed opacity-50">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 transition-colors duration-500">
                                    <span className="material-symbols-outlined text-xl">report</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Signalements</p>
                                    <p className="text-[9px] text-gray-500">Historique de vos signalements (bientôt)</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </section>

                {/* Preferences Section */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-2 transition-colors duration-500">Préférences</h3>
                    <div className="rounded-3xl border bg-white dark:bg-[#161b2e] border-black/5 dark:border-white/5 shadow-sm divide-y divide-black/5 dark:divide-white/5 transition-colors duration-500">
                        {/* Dark Mode Toggle */}
                        <div className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 transition-colors duration-500">
                                    <span className="material-symbols-outlined text-xl">{darkMode ? 'dark_mode' : 'light_mode'}</span>
                                </div>
                                <p className="text-xs font-bold">Mode Sombre</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} className="sr-only peer" />
                                <div className={`w-11 h-6 rounded-full peer transition-all ${darkMode ? 'bg-[#D4AF37] after:translate-x-full after:border-white' : 'bg-gray-200'} after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                            </label>
                        </div>

                        {/* Ghost Mode Toggle */}
                        <div className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-colors duration-500">
                                    <span className="material-symbols-outlined text-xl">visibility_off</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Mode Fantôme</p>
                                    <p className="text-[9px] text-gray-500">Naviguer sans être vu (Invisibilité)</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={ghostMode} onChange={toggleGhostMode} className="sr-only peer" />
                                <div className={`w-11 h-6 rounded-full peer transition-all ${ghostMode ? 'bg-[#D4AF37] after:translate-x-full after:border-white' : 'bg-gray-200'} after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Support Section */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-2 transition-colors duration-500">Support & Légal</h3>
                    <div className="rounded-3xl border bg-white dark:bg-[#161b2e] border-black/5 dark:border-white/5 shadow-sm divide-y divide-black/5 dark:divide-white/5 transition-colors duration-500">
                        <Link to="/help" className="p-5 flex items-center justify-between group active:bg-black/5 dark:active:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 transition-colors duration-500">
                                    <span className="material-symbols-outlined text-xl">help</span>
                                </div>
                                <p className="text-xs font-bold">Centre d'aide</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                        </Link>
                        <Link to="/legal" className="p-5 flex items-center justify-between group active:bg-black/5 dark:active:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 transition-colors duration-500">
                                    <span className="material-symbols-outlined text-xl">description</span>
                                </div>
                                <p className="text-xs font-bold">Mentions légales</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </Link>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="space-y-4 pt-4">
                    <button
                        onClick={handleDeleteAccount}
                        className="w-full p-5 rounded-3xl bg-red-500/5 border border-red-500/10 flex items-center justify-center gap-3 text-red-500 font-bold text-xs uppercase tracking-widest active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">delete_forever</span>
                        Supprimer mon compte
                    </button>
                    <p className="text-center text-[10px] text-gray-500 italic">Version 2.1.0 (Bénin)</p>
                </section>
            </main>

            {/* Password Modal */}
            <AnimatePresence>
                {showPasswordForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-[#161b2e] w-full max-w-sm rounded-[2.5rem] p-8 border border-black/5 dark:border-white/10 shadow-2xl">
                            <h2 className="text-xl font-black italic tracking-tighter mb-6 text-[#101322] dark:text-white">Sécurité</h2>
                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Mot de passe actuel</label>
                                    <input
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 text-xs italic focus:ring-[#D4AF37]"
                                    />
                                    {errors.current_password && <p className="text-red-500 text-[9px] mt-1 ml-2">{errors.current_password[0]}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        value={passwordData.password}
                                        onChange={e => setPasswordData({ ...passwordData, password: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 text-xs italic focus:ring-[#D4AF37]"
                                    />
                                    {errors.password && <p className="text-red-500 text-[9px] mt-1 ml-2">{errors.password[0]}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Confirmer</label>
                                    <input
                                        type="password"
                                        value={passwordData.password_confirmation}
                                        onChange={e => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 text-xs italic focus:ring-[#D4AF37]"
                                    />
                                </div>
                                {errors.general && <p className="text-red-500 text-[9px] text-center font-bold">{errors.general}</p>}
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowPasswordForm(false)} className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-white/10 font-bold text-xs uppercase">Annuler</button>
                                    <button type="submit" disabled={processing} className="flex-1 py-4 rounded-2xl bg-[#D4AF37] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-[#D4AF37]/30">
                                        {processing ? '...' : 'Valider'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
