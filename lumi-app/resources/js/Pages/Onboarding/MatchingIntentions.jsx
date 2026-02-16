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

            {/* Header / Progress bar */}
            <div className="w-full pt-6 pb-10 flex items-center justify-between z-10">
                <button onClick={() => window.history.back()} className="size-10 flex items-center justify-center rounded-xl bg-[#161b2e] border border-white/10 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-gray-400 text-sm">arrow_back_ios</span>
                </button>
                <div className="flex-1 mx-8 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="w-2/5 h-full bg-[#D4AF37] rounded-full shadow-lg shadow-[#D4AF37]/30"></div>
                </div>
                <span className="text-[10px] font-black text-[#D4AF37] tracking-[0.2em] leading-none uppercase italic">02/05</span>
            </div>

            <div className="flex-1 flex flex-col space-y-10 z-10">
                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tighter text-white leading-none italic uppercase">
                        Que recherchez- <br /> vous vraiment ?
                    </h1>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed italic">Choisissez votre intention maîtresse <br /> pour des rencontres qui vous ressemblent.</p>
                </div>

                <div className="space-y-5 overflow-y-auto max-h-[55vh] pb-4 px-1">
                    {intentions.map((intent) => (
                        <button
                            key={intent.id}
                            onClick={() => setData('intention', intent.id)}
                            className={`w-full text-left p-6 bg-[#161b2e] border-2 rounded-[2rem] transition-all relative ${data.intention === intent.id
                                ? `border-[#D4AF37] bg-[#D4AF37]/5 shadow-2xl shadow-[#D4AF37]/5 scale-[1.02]`
                                : 'border-white/5 hover:border-white/10'
                                }`}
                        >
                            <div className="flex items-start space-x-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-white/5 border border-white/10`}>
                                    {intent.icon}
                                </div>
                                <div className="flex-1 pr-8">
                                    <h3 className="font-black text-white italic uppercase text-xs tracking-widest">{intent.label}</h3>
                                    <p className="text-[10px] text-gray-500 mt-2 leading-relaxed font-medium italic">{intent.description}</p>
                                </div>
                            </div>
                            {data.intention === intent.id && (
                                <div className="absolute top-6 right-6 text-[#D4AF37]">
                                    <span className="material-symbols-outlined font-black text-2xl">check_circle</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="bg-[#D4AF37]/5 p-5 rounded-[2rem] flex items-start space-x-4 mt-auto border border-[#D4AF37]/10">
                    <div className="text-[#D4AF37] mt-1">
                        <span className="material-symbols-outlined text-xl">verified_user</span>
                    </div>
                    <p className="text-[9px] text-gray-400 leading-relaxed font-black uppercase tracking-wider italic">
                        Votre intention est exclusivement visible par les membres vérifiés pour garantir <br /> l'intégrité de la communauté Lumi Benin.
                    </p>
                </div>

                <div className="pb-10">
                    <button
                        disabled={!data.intention}
                        onClick={handleSubmit}
                        className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 ${!data.intention
                            ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                            : 'bg-[#D4AF37] text-[#101322] border border-[#D4AF37] hover:brightness-110 shadow-[#D4AF37]/20 uppercase italic font-black'
                            }`}
                    >
                        Suivant
                    </button>
                </div>
            </div>
        </div>
    );
}
