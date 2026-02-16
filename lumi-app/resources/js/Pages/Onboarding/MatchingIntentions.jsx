import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';

const intentions = [
    {
        id: 'mariage',
        label: 'Relation Sérieuse',
        description: "Pour ceux qui cherchent l'engagement, la construction d'un foyer et le long terme.",
        icon: '❤️',
        color: 'border-yellow-500 shadow-yellow-100',
        badge: 'bg-yellow-500'
    },
    {
        id: 'decouverte',
        label: 'Découverte & Sorties',
        description: "Rencontres amicales, sorties culturelles à Cotonou et networking enrichissant.",
        icon: '🧭',
        color: 'border-blue-500 shadow-blue-100',
        badge: 'bg-blue-500'
    },
    {
        id: 'fun',
        label: 'Fun & Sans prise de tête',
        description: "Profiter du moment présent, sans pression, pour des rencontres légères.",
        icon: '⚡',
        color: 'border-purple-500 shadow-purple-100',
        badge: 'bg-purple-500'
    },
    {
        id: 'business',
        label: 'Réseautage / Business',
        description: "Élargissez votre cercle professionnel et trouvez des opportunités.",
        icon: '💼',
        color: 'border-indigo-500 shadow-indigo-100',
        badge: 'bg-indigo-500'
    }
];

export default function MatchingIntentions() {
    const { data, setData, post, processing } = useForm({
        intention: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/onboarding/intentions');
    };

    return (
        <div className="min-h-screen bg-[#101322] flex flex-col p-6 text-white font-['Be_Vietnam_Pro'] relative overflow-hidden">
            <Head title="Votre Intention" />

            {/* Benin Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(#E1AD01 0.5px, transparent 0.5px)',
                    backgroundSize: '24px 24px'
                }}>
            </div>

            <div className="w-full pt-4 pb-8 flex items-center justify-between z-10">
                <button onClick={() => window.history.back()} className="text-white/60 hover:text-[#E1AD01] transition-colors">
                    <span className="material-symbols-outlined">arrow_back_ios</span>
                </button>
                <div className="flex-1 mx-8 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-2/5 h-full bg-[#E1AD01] rounded-full shadow-[0_0_10px_rgba(225,173,1,0.5)]"></div>
                </div>
                <span className="text-xs font-bold text-[#E1AD01] tracking-widest leading-none">02/05</span>
            </div>

            <div className="flex-1 flex flex-col space-y-6 z-10">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight text-white leading-tight">Que recherchez-vous vraiment ?</h1>
                    <p className="text-white/60 text-sm font-medium leading-relaxed">Choisissez votre intention pour des rencontres qui vous ressemblent au Bénin.</p>
                </div>

                <div className="space-y-4 overflow-y-auto max-h-[60vh] pb-4 px-1">
                    {intentions.map((intent) => (
                        <button
                            key={intent.id}
                            onClick={() => setData('intention', intent.id)}
                            className={`w-full text-left p-5 bg-white/5 border-2 rounded-3xl transition-all relative ${data.intention === intent.id
                                ? `border-[#E1AD01] bg-[#E1AD01]/10 shadow-[0_0_20px_rgba(225,173,1,0.1)] scale-[1.02]`
                                : 'border-white/5 hover:border-white/20'
                                }`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${intent.badge} bg-opacity-20 text-opacity-100`}>
                                    {intent.icon}
                                </div>
                                <div className="flex-1 pr-6">
                                    <h3 className="font-bold text-white">{intent.label}</h3>
                                    <p className="text-xs text-white/40 mt-1 leading-relaxed">{intent.description}</p>
                                </div>
                            </div>
                            {data.intention === intent.id && (
                                <div className="absolute top-4 right-4 text-[#E1AD01]">
                                    <span className="material-symbols-outlined font-bold">check_circle</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="bg-[#0f2cbd]/10 p-4 rounded-2xl flex items-start space-x-3 mt-auto border border-[#0f2cbd]/20">
                    <div className="text-[#0f2cbd] mt-1">
                        <span className="material-symbols-outlined text-xl">verified_user</span>
                    </div>
                    <p className="text-[10px] text-white/60 leading-tight">
                        Votre intention est visible sur votre profil pour garantir la transparence et la sécurité de la communauté Lumi Benin.
                    </p>
                </div>

                <div className="pb-8">
                    <button
                        disabled={!data.intention}
                        onClick={handleSubmit}
                        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 ${!data.intention
                            ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                            : 'bg-white text-[#101322] hover:bg-[#E1AD01] hover:text-[#101322]'
                            }`}
                    >
                        Continuer
                    </button>
                </div>
            </div>
        </div>
    );
}
