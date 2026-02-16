import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';

const tags = [
    { label: '🏃‍♂️ Sport', id: 'sport' },
    { label: '🎨 Art', id: 'art' },
    { label: '🍕 Cuisine', id: 'cuisine' },
    { label: '✈️ Voyage', id: 'voyage' },
    { label: '🎸 Musique', id: 'musique' },
    { label: '🎮 Gaming', id: 'gaming' },
    { label: '🎬 Cinéma', id: 'cinema' },
    { label: '📚 Lecture', id: 'lecture' },
    { label: '💼 Entrepreneur', id: 'entrepreneur' },
    { label: '💃 Danse', id: 'danse' },
    { label: '🍸 Nightlife', id: 'nightlife' },
    { label: '🐶 Animaux', id: 'animaux' },
    { label: '📸 Photo', id: 'photo' },
    { label: '🧘 Bien-être', id: 'bien-etre' },
    { label: '🍷 Vin / Cocktails', id: 'vin' },
];

export default function InterestsSelection() {
    const { data, setData, post, processing } = useForm({
        interests: [],
    });

    const toggleTag = (id) => {
        const newInterests = data.interests.includes(id)
            ? data.interests.filter((i) => i !== id)
            : data.interests.length < 5 ? [...data.interests, id] : data.interests;
        setData('interests', newInterests);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/onboarding/interests');
    };

    return (
        <div className="min-h-screen bg-[#101322] flex flex-col p-6 text-white font-['Be_Vietnam_Pro'] relative overflow-hidden">
            <Head title="Vos Intérêts" />

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
                    <div className="w-3/5 h-full bg-[#E1AD01] rounded-full shadow-[0_0_10px_rgba(225,173,1,0.5)]"></div>
                </div>
                <span className="text-xs font-bold text-[#E1AD01] tracking-widest leading-none">03/05</span>
            </div>

            <div className="flex-1 flex flex-col space-y-6 z-10">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight text-white leading-tight">Tes centres d'intérêt</h1>
                    <p className="text-white/60 text-sm font-medium leading-relaxed">Choisis de 3 à 5 tags pour affiner les affinités avec d'autres membres au Bénin.</p>
                </div>

                <div className="flex flex-wrap gap-3 pt-4">
                    {tags.map((tag) => (
                        <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={`px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border ${data.interests.includes(tag.id)
                                ? 'bg-[#E1AD01] text-[#101322] border-[#E1AD01] shadow-xl shadow-[#E1AD01]/20 scale-[1.05]'
                                : 'bg-white/5 text-white/60 border-white/5 hover:border-white/20'
                                }`}
                        >
                            {tag.label}
                        </button>
                    ))}
                </div>

                <div className="mt-auto pb-8 space-y-6">
                    <div className="text-center">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${data.interests.length >= 3 ? 'text-green-400' : 'text-white/40'}`}>
                            {data.interests.length} / 5 sélectionnés
                        </span>
                    </div>
                    <button
                        disabled={data.interests.length < 3}
                        onClick={handleSubmit}
                        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 ${data.interests.length < 3
                            ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                            : 'bg-white text-[#101322] hover:bg-[#E1AD01]'
                            }`}
                    >
                        Continuer
                    </button>
                </div>
            </div>
        </div>
    );
}
