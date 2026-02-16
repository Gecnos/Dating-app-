import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Settings() {
    const { auth } = usePage().props;
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) return saved === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return true;
    });
    const [ghostMode, setGhostMode] = useState(auth.user.is_ghost_mode || false);
    const [blurEnabled, setBlurEnabled] = useState(auth.user.blur_enabled || false);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const toggleGhostMode = () => {
        const newValue = !ghostMode;
        setGhostMode(newValue);
        axios.post(route('user.ghost-mode')).catch(err => {
            setGhostMode(!newValue);
            console.error(err);
        });
    };

    const toggleBlur = (e) => {
        const value = e.target.checked;
        setBlurEnabled(value);
        router.post(route('profile.update'), { blur_enabled: value }, { preserveState: true });
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-[#101322] text-white' : 'bg-[#F9F9FB] text-[#111218]'} font-sans pb-32 overflow-x-hidden transition-colors duration-500`}>
            <Head title="Paramètres - Lumi" />

            {/* Header */}
            <header className={`sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b ${darkMode ? 'bg-[#101322]/80 border-white/10' : 'bg-white/80 border-gray-100'} backdrop-blur-xl`}>
                <Link href={route('profile', 'me')} className="w-10 h-10 flex items-center justify-start">
                    <span className={`material-symbols-outlined ${darkMode ? 'text-white' : 'text-gray-800'}`}>arrow_back_ios</span>
                </Link>
                <h1 className="text-lg font-bold">Paramètres</h1>
                <div className="w-10" />
            </header>

            <main className="max-w-lg mx-auto p-6 space-y-8">
                {/* Account Section */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Compte & Sécurité</h3>
                    <div className={`rounded-3xl border ${darkMode ? 'bg-[#161b2e] border-white/5' : 'bg-white border-gray-100'} shadow-sm divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-50'}`}>
                        <div className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                    <span className="material-symbols-outlined text-xl">alternate_email</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Email</p>
                                    <p className="text-[10px] text-gray-500">{auth.user.email}</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                        </div>
                        <div className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                                    <span className="material-symbols-outlined text-xl">lock</span>
                                </div>
                                <p className="text-xs font-bold">Changer le mot de passe</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                        </div>
                    </div>
                </section>

                {/* Privacy Management section (New) */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Confidentialité</h3>
                    <div className={`rounded-3xl border ${darkMode ? 'bg-[#161b2e] border-white/5' : 'bg-white border-gray-100'} shadow-sm divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-50'}`}>
                        <Link href={route('settings.blocked')} className="w-full text-left p-5 flex items-center justify-between group active:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
                                    <span className="material-symbols-outlined text-xl">block</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Utilisateurs bloqués</p>
                                    <p className="text-[9px] text-gray-500">Gérer les profils que vous avez bloqués</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </Link>
                        <Link href={route('settings.reports')} className="w-full text-left p-5 flex items-center justify-between group active:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
                                    <span className="material-symbols-outlined text-xl">report</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Signalements</p>
                                    <p className="text-[9px] text-gray-500">Historique de vos signalements</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </Link>
                    </div>
                </section>

                {/* Preferences Section */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Préférences</h3>
                    <div className={`rounded-3xl border ${darkMode ? 'bg-[#161b2e] border-white/5' : 'bg-white border-gray-100'} shadow-sm divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-50'}`}>
                        {/* Dark Mode Toggle */}
                        <div className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
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
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
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

                        {/* Blur Mode Toggle */}
                        <div className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>
                                    <span className="material-symbols-outlined text-xl">blur_on</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Protection Photo (Flou)</p>
                                    <p className="text-[9px] text-gray-500">Photos floues jusqu'au match</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={blurEnabled} onChange={toggleBlur} className="sr-only peer" />
                                <div className={`w-11 h-6 rounded-full peer transition-all ${blurEnabled ? 'bg-[#D4AF37] after:translate-x-full after:border-white' : 'bg-gray-200'} after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Support Section */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Support & Légal</h3>
                    <div className={`rounded-3xl border ${darkMode ? 'bg-[#161b2e] border-white/5' : 'bg-white border-gray-100'} shadow-sm divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-50'}`}>
                        <Link href={route('help')} className="p-5 flex items-center justify-between group active:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
                                    <span className="material-symbols-outlined text-xl">help</span>
                                </div>
                                <p className="text-xs font-bold">Centre d'aide</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                        </Link>
                        <Link href={route('legal.terms')} className="p-5 flex items-center justify-between group active:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                                    <span className="material-symbols-outlined text-xl">description</span>
                                </div>
                                <p className="text-xs font-bold">Conditions générales</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </Link>
                        <Link href={route('legal.privacy')} className="p-5 flex items-center justify-between group active:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                    <span className="material-symbols-outlined text-xl">security</span>
                                </div>
                                <p className="text-xs font-bold">Politique de confidentialité</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </Link>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="space-y-4 pt-4">
                    <button
                        onClick={() => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                                router.delete(route('user.destroy'));
                            }
                        }}
                        className="w-full p-5 rounded-3xl bg-red-500/5 border border-red-500/10 flex items-center justify-center gap-3 text-red-500 font-bold text-xs uppercase tracking-widest active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">delete_forever</span>
                        Supprimer mon compte
                    </button>
                    <p className="text-center text-[10px] text-gray-500 italic">Version 2.1.0 (Bénin)</p>
                </section>
            </main>
        </div >
    );
}
