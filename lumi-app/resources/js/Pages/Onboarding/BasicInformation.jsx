import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';

export default function BasicInformation() {
    const { auth } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        name: auth.user?.name || '',
        date_of_birth: '',
        gender: '',
        job: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/onboarding/basic');
    };

    return (
        <div className="min-h-screen bg-[#101322] flex flex-col p-6 text-white font-['Be_Vietnam_Pro'] relative overflow-hidden">
            <Head>
                <title>Lumi - Informations de base</title>
            </Head>

            {/* Benin Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(#D4AF37 0.5px, transparent 0.5px)',
                    backgroundSize: '24px 24px'
                }}>
            </div>

            {/* Header / Progress bar */}
            <div className="w-full pt-4 pb-8 flex items-center justify-between z-10">
                <button onClick={() => window.history.back()} className="text-white/60 hover:text-[#D4AF37] transition-colors">
                    <span className="material-symbols-outlined">arrow_back_ios</span>
                </button>
                <div className="flex-1 mx-8 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-1/5 h-full bg-[#D4AF37] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                </div>
                <span className="text-xs font-bold text-[#D4AF37] tracking-widest leading-none">01/05</span>
            </div>

            <div className="flex-1 flex flex-col space-y-10 z-10">
                <div className="space-y-4">
                    <h1 className="text-3xl font-black tracking-tight text-white leading-tight">Parle-nous de toi</h1>
                    <p className="text-white/60 text-sm font-medium leading-relaxed">Ces informations nous aident à trouver des profils qui te correspondent au Bénin.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 flex-1 flex flex-col">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] ml-1">Prénom ou Pseudo</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ex: Koffi"
                                className="w-full bg-white/5 border border-white/10 py-5 px-6 rounded-2xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all placeholder:text-white/20 text-white font-semibold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] ml-1">Date de naissance</label>
                            <input
                                type="date"
                                value={data.date_of_birth}
                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 py-5 px-6 rounded-2xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-white font-semibold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] ml-1">Métier / Profession</label>
                            <input
                                type="text"
                                value={data.job}
                                onChange={(e) => setData('job', e.target.value)}
                                placeholder="Ex: Développeur, Commerçant..."
                                className="w-full bg-white/5 border border-white/10 py-5 px-6 rounded-2xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all placeholder:text-white/20 text-white font-semibold"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] ml-1">Je suis</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['Homme', 'Femme'].map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setData('gender', opt)}
                                        className={`py-5 rounded-2xl font-bold tracking-wide transition-all border ${data.gender === opt
                                            ? 'bg-[#D4AF37] text-[#101322] border-[#D4AF37] shadow-xl shadow-[#D4AF37]/20 scale-[1.02]'
                                            : 'bg-white/5 text-white/60 border-white/10 hover:border-[#D4AF37]/50'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pb-10">
                        <button
                            type="submit"
                            disabled={!data.name || !data.date_of_birth || !data.gender}
                            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 ${!data.name || !data.date_of_birth || !data.gender
                                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                : 'bg-white text-[#101322] hover:bg-[#D4AF37] hover:text-[#101322]'
                                }`}
                        >
                            Continuer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
