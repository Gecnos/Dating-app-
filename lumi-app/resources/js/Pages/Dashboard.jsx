import React from 'react';
import { Head } from '@inertiajs/react';

export default function Dashboard({ stats }) {
    const cards = [
        { label: 'Utilisateurs Totaux', value: stats.total_users, icon: '👥', color: 'bg-blue-500' },
        { label: 'Membres Vérifiés', value: stats.verified_users, icon: '✅', color: 'bg-green-500' },
        { label: 'Attente Vérif.', value: stats.pending_verifications, icon: '⏳', color: 'bg-yellow-500' },
        { label: 'Chiffre d\'Affaires', value: '0 FCFA', icon: '💰', color: 'bg-purple-500' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <Head title="Admin Dashboard" />

            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">LUMI CONTROL</h1>
                        <p className="text-gray-500">Vue d'ensemble de la plateforme au Bénin.</p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center space-x-6">
                            <div className={`w-14 h-14 rounded-3xl ${card.color} flex items-center justify-center text-2xl shadow-lg shadow-current/20`}>
                                {card.icon}
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">{card.label}</span>
                                <span className="text-2xl font-black text-gray-900">{card.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Placeholder Chart/List */}
                    <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 h-96 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="text-gray-200">
                            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Activité par Ville</h3>
                        <p className="text-gray-400 max-w-xs uppercase text-[10px] font-black tracking-widest">Graphique de croissance (Cotonou vs Porto-Novo)</p>
                    </div>

                    <div className="bg-[#1e40af] rounded-[3rem] p-8 text-white shadow-xl shadow-blue-100 flex flex-col">
                        <h3 className="text-lg font-black mb-6 uppercase tracking-widest text-blue-200">Actions Rapides</h3>
                        <div className="space-y-4">
                            <a href="/admin/verify" className="block w-full bg-white/10 hover:bg-white/20 p-4 rounded-2xl font-bold transition-all border border-white/10">
                                🛡️ Vérifier les Selfies
                            </a>
                            <button className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-2xl font-bold text-left transition-all border border-white/10">
                                🚫 Liste Noire / Ban
                            </button>
                            <button className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-2xl font-bold text-left transition-all border border-white/10">
                                💎 Gérer les Crédits
                            </button>
                        </div>
                        <div className="mt-auto pt-8">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-black uppercase text-blue-300">Statut du Serveur</span>
                                <div className="flex items-center space-x-2 mt-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-bold">Lumi Reverb : OK</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
