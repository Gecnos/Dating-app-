import React from 'react';
import { Head } from '@inertiajs/react';

export default function CreditsVIP() {
    const plans = [
        { credits: '10 Crédits', price: '2 500 FCFA', badge: 'Standard' },
        { credits: '50 Crédits', price: '10 000 FCFA', badge: 'Populaire', featured: true },
        { credits: '150 Crédits', price: '25 000 FCFA', badge: 'Expert' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] flex flex-col font-sans mb-24 text-[#101322] dark:text-white transition-colors duration-500">
            <Head title="Lumi Premium & Crédits" />

            {/* Header */}
            <div className="bg-white dark:bg-[#161b2e] p-8 pb-16 text-center space-y-6 rounded-b-[4rem] shadow-2xl border-b border-black/5 dark:border-white/10 relative overflow-hidden transition-colors duration-500">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-[#101322] dark:text-white transition-colors duration-500">Lumi Premium</h1>
                    <p className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-widest mt-2 transition-colors duration-500">Boostez vos rencontres avec style.</p>
                </div>

                <div className="relative z-10 inline-flex bg-gray-50 dark:bg-[#1a1f35] px-8 py-5 rounded-[2rem] border border-[#D4AF37]/30 items-center space-x-5 shadow-2xl transition-colors duration-500">
                    <div className="size-12 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 transition-all">
                        <span className="material-symbols-outlined text-white dark:text-[#101322] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
                    </div>
                    <div className="text-left">
                        <span className="block text-[9px] uppercase font-black text-[#D4AF37] tracking-widest mb-1">Votre Solde</span>
                        <span className="text-2xl font-black italic text-[#101322] dark:text-white transition-colors duration-500">0 Crédits</span>
                    </div>
                </div>

                {/* Decorative crown */}
                <span className="material-symbols-outlined absolute -top-8 -right-8 text-[12rem] text-black/5 dark:text-white/5 rotate-12 pointer-events-none transition-colors duration-500">crown</span>
            </div>

            <div className="flex-1 -mt-10 px-6 space-y-10 relative z-20">
                {/* VIP Features */}
                <div className="bg-white dark:bg-[#1a1f35] rounded-[2.5rem] p-8 shadow-2xl border border-black/5 dark:border-white/10 space-y-6 transition-colors duration-500">
                    <h2 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.2em] flex items-center space-x-3">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                        <span>Privilèges Exclusifs</span>
                    </h2>
                    <ul className="grid grid-cols-2 gap-4">
                        {[
                            'Swipes Illimités',
                            'Boost de Visibilité',
                            'Mode Invisible',
                            'Sans Publicité',
                            'Replay Illimité',
                            'Priorité Messages'
                        ].map((feat, i) => (
                            <li key={i} className="flex items-center space-x-3 text-[11px] text-gray-500 dark:text-gray-300 font-black uppercase tracking-tighter italic transition-colors duration-500">
                                <div className="size-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center shrink-0 transition-colors duration-500">
                                    <span className="material-symbols-outlined text-[12px] text-[#D4AF37]">done</span>
                                </div>
                                <span>{feat}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Credit Packages */}
                <div className="space-y-6">
                    <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-2 italic">Forfaits de Crédits</h2>
                    <div className="space-y-4">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative group transition-colors duration-500 ${plan.featured
                                    ? 'bg-[#D4AF37] border-[#D4AF37] text-white dark:text-[#101322] shadow-2xl shadow-[#D4AF37]/20 scale-[1.02]'
                                    : 'bg-white dark:bg-[#161b2e] border-black/5 dark:border-white/5 text-[#101322] dark:text-white hover:border-[#D4AF37]/50 shadow-sm dark:shadow-none font-bold'
                                    }`}
                            >
                                {plan.featured && (
                                    <div className="absolute -top-3.5 right-10 bg-[#101322] text-[#D4AF37] text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#D4AF37]/30 shadow-lg transition-all duration-500">
                                        Recommandé
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black italic tracking-tight">{plan.credits}</h3>
                                        <p className={`text-[10px] uppercase font-black tracking-widest mt-1 ${plan.featured ? 'opacity-60' : 'text-[#D4AF37]'}`}>{plan.badge}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black italic block mb-1">{plan.price}</span>
                                        <div className={`flex items-center justify-end gap-1.5 ${plan.featured ? 'opacity-80' : 'text-gray-500'}`}>
                                            <span className="material-symbols-outlined text-sm">payments</span>
                                            <span className="text-[9px] font-black uppercase tracking-tighter">KKiaPay</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* KKiaPay Bottom Button */}
                <div className="pb-12">
                    <button className="w-full bg-[#D4AF37] text-white dark:text-[#101322] h-18 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#D4AF37]/20 flex items-center justify-center space-x-4 active:scale-95 transition-all transition-colors duration-500">
                        <span>Payer sécurisé</span>
                        <span className="material-symbols-outlined">shield_check</span>
                    </button>
                    <p className="text-center mt-4 text-[9px] text-gray-600 font-black uppercase tracking-widest px-8">
                        Paiement sécurisé via KKiaPay. Vos données sont protégées.
                    </p>
                </div>
            </div>

        </div>
    );
}
