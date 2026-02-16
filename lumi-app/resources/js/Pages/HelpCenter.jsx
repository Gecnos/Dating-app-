import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { id: 'security', title: 'Ma Sécurité', subtitle: 'Conseils et outils de protection', icon: 'shield', featured: true },
        { id: 'account', title: 'Mon Compte', subtitle: 'Gérer ses infos', icon: 'person', featured: false },
        { id: 'wallet', title: 'Crédits & Paiements', subtitle: 'Paiements locaux', icon: 'account_balance_wallet', featured: false },
        { id: 'matches', title: 'Matchs & Chat', subtitle: 'Interaction & UX', icon: 'favorite', featured: false }
    ];

    const popularArticles = [
        { id: 1, title: 'Comment vérifier mon profil ?', icon: 'verified', color: '#D4AF37' },
        { id: 2, title: 'Signaler un comportement suspect', icon: 'report_problem', color: '#ef4444' },
        { id: 3, title: 'Gérer mon abonnement Premium', icon: 'diamond', color: '#0f2cbd' }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-[#101322] text-slate-900 dark:text-white font-sans flex justify-center overflow-x-hidden">
            <Head title="Centre d'Aide & Sécurité - Lumi" />

            <div className="w-full max-w-md bg-white dark:bg-[#101322] flex flex-col h-full min-h-screen relative overflow-hidden shadow-2xl">
                {/* Header Section */}
                <div className="relative z-10 px-6 pt-6 pb-4 bg-white dark:bg-[#101322]">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => window.history.back()} className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1c1d27] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#282b39] transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1c1d27] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#282b39] transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#D4AF37] rounded-full"></span>
                        </button>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">Centre d'Aide</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Support & Sécurité pour votre tranquillité</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-[#D4AF37] transition-colors">search</span>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-100 dark:bg-[#1c1d27] border-0 rounded-2xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-[#D4AF37]/50 focus:bg-white dark:focus:bg-[#252836] transition-all shadow-sm"
                            placeholder="Rechercher une réponse..."
                        />
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-64">
                    {/* Categories Grid */}
                    <div className="px-6 py-2">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Catégories</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className={`${cat.featured ? 'col-span-2' : ''} relative overflow-hidden rounded-2xl ${cat.featured ? 'bg-gradient-to-br from-[#1c1d27] to-[#0f2cbd]/20 border border-[#D4AF37]/20 p-5' : 'bg-slate-100 dark:bg-[#1c1d27] p-4 border border-transparent'} flex ${cat.featured ? 'items-center justify-between' : 'flex-col gap-3 items-start'} group active:scale-[0.98] transition-all cursor-pointer shadow-sm`}
                                >
                                    <div className={`flex flex-col gap-1 z-10 ${cat.featured ? 'flex-1' : ''}`}>
                                        <h3 className={`${cat.featured ? 'text-white text-lg' : 'text-slate-900 dark:text-white text-sm'} font-bold`}>{cat.title}</h3>
                                        <p className={`${cat.featured ? 'text-slate-400' : 'hidden'} text-xs`}>{cat.subtitle}</p>
                                    </div>
                                    <div className={`${cat.featured ? 'w-12 h-12 border border-[#D4AF37]/30 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black' : 'w-10 h-10 bg-primary/10 dark:bg-white/5 text-primary dark:text-white'} rounded-full flex items-center justify-center transition-colors z-10`}>
                                        <span className={`material-symbols-outlined ${cat.featured ? '' : 'text-[20px]'}`}>{cat.icon}</span>
                                    </div>
                                    {cat.featured && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular Articles */}
                    <div className="mt-6 px-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Articles Populaires</h2>
                        <div className="flex flex-col space-y-3">
                            {popularArticles.map((article) => (
                                <button key={article.id} className="w-full text-left bg-white dark:bg-[#1c1d27] p-4 rounded-xl shadow-sm border border-slate-100 dark:border-[#282b39] flex items-center justify-between group active:scale-[0.99] transition-all">
                                    <div className="flex gap-3 items-center">
                                        <div className="shrink-0" style={{ color: article.color }}>
                                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{article.icon}</span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-white transition-colors">{article.title}</span>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Teaser */}
                    <div className="mt-8 mx-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-[#151725] dark:to-[#1c1d27] relative overflow-hidden shadow-lg shadow-black/20">
                        <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/10 -skew-x-12"></div>
                        <h3 className="text-white font-bold relative z-10">Consulter la FAQ complète</h3>
                        <p className="text-slate-300 text-xs mt-1 relative z-10 max-w-[70%] italic">Trouvez des réponses à toutes vos questions sur l'utilisation de l'application.</p>
                        <button className="mt-3 text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-1 relative z-10 hover:text-white transition-colors">
                            Voir tout <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="absolute bottom-0 w-full bg-white/95 dark:bg-[#101322]/98 backdrop-blur-lg border-t border-slate-100 dark:border-[#1c1d27] p-5 pb-10 z-20 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                    <h2 className="text-[10px] font-black text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-[0.2em] text-center">Besoin d'aide supplémentaire ?</h2>
                    <div className="flex flex-col gap-3">
                        <button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 px-4 rounded-2xl font-bold text-sm shadow-lg shadow-green-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                            <span className="material-symbols-outlined">chat</span>
                            Contacter le Support via WhatsApp
                        </button>
                        <button className="w-full bg-slate-100 dark:bg-[#1c1d27] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#282b39] py-4 px-4 rounded-2xl font-bold text-sm border border-slate-200 dark:border-[#2f3344] flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                            <span className="material-symbols-outlined">mail</span>
                            Envoyer un Email
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
