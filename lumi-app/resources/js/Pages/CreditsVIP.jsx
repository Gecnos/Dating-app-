import React from 'react';
import { Head } from '@inertiajs/react';
import NavigationBar from '@/Components/NavigationBar';

export default function CreditsVIP() {
    const plans = [
        { credits: '10 Crédits', price: '2 500 FCFA', badge: 'Standard' },
        { credits: '50 Crédits', price: '10 000 FCFA', badge: 'Populaire', featured: true },
        { credits: '150 Crédits', price: '25 000 FCFA', badge: 'Expert' },
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans mb-24">
            <Head title="Lumi VIP & Crédits" />

            {/* Header */}
            <div className="bg-[#1e40af] p-8 pb-16 text-white text-center space-y-4 rounded-b-[3rem] shadow-2xl">
                <h1 className="text-3xl font-black">Lumi VIP</h1>
                <p className="text-blue-100 text-sm opacity-80">Boostez vos rencontres et soutenez la communauté.</p>
                <div className="inline-flex bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 items-center space-x-3">
                    <span className="text-2xl">💎</span>
                    <div className="text-left">
                        <span className="block text-[10px] uppercase font-black text-blue-200">Solde actuel</span>
                        <span className="text-xl font-black">0 Crédits</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 -mt-8 px-6 space-y-6">
                {/* VIP Features */}
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-4">
                    <h2 className="text-lg font-black text-gray-800 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>
                        <span>Avantages VIP</span>
                    </h2>
                    <ul className="grid grid-cols-2 gap-3">
                        {[
                            'Swipes Illimités',
                            'Boost de Visibilité',
                            'Mode Invisible',
                            'Zéro Publicité',
                            'Replay illimité',
                            'Priorité messages'
                        ].map((feat, i) => (
                            <li key={i} className="flex items-center space-x-2 text-xs text-gray-600 font-medium">
                                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                <span>{feat}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Credit Packages */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-gray-800 ml-2">Acheter des crédits</h2>
                    <div className="space-y-3">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative ${plan.featured
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-200 scale-[1.02]'
                                    : 'bg-white border-gray-100 text-gray-900 border-opacity-100'
                                    }`}
                            >
                                {plan.featured && (
                                    <span className="absolute -top-3 right-8 bg-[#D4AF37] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">Le plus populaire</span>
                                )}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black">{plan.credits}</h3>
                                        <p className={`text-xs ${plan.featured ? 'text-blue-100' : 'text-gray-400 font-medium'}`}>{plan.badge}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-2xl font-black ${plan.featured ? 'text-white' : 'text-blue-600'}`}>{plan.price}</span>
                                        <span className={`block text-[10px] ${plan.featured ? 'text-blue-200' : 'text-gray-400'}`}>Paiement KKiaPay</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* KKiaPay Bottom Button Placeholder */}
            <div className="px-6 mt-8">
                <button className="w-full bg-[#1e40af] text-white h-16 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 flex items-center justify-center space-x-3 active:scale-95 transition-transform">
                    <span>Payer avec KKiaPay</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </button>
            </div>

            <NavigationBar />
        </div>
    );
}
