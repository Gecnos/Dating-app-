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
            <div className="w-full pt-6 pb-10 flex items-center justify-between z-10">
                <button onClick={() => window.history.back()} className="size-10 flex items-center justify-center rounded-xl bg-[#161b2e] border border-white/10 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-gray-400 text-sm">arrow_back_ios</span>
                </button>
                <div className="flex-1 mx-8 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="w-1/5 h-full bg-[#D4AF37] rounded-full shadow-lg shadow-[#D4AF37]/30"></div>
                </div>
                <span className="text-[10px] font-black text-[#D4AF37] tracking-[0.2em] leading-none uppercase italic">01/05</span>
            </div>

            <div className="flex-1 flex flex-col space-y-12 z-10">
                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tighter text-white leading-none italic uppercase">
                        Parle-nous <br /> de toi
                    </h1>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed italic">Ces précieux détails nous aident à trouver <br /> l'élite qui vous correspond.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10 flex-1 flex flex-col">
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] ml-1">Prénom ou Pseudo</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ex: Koffi"
                                className="w-full bg-[#161b2e] border border-white/10 py-5 px-6 rounded-3xl focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all placeholder:text-gray-700 text-white font-black italic shadow-inner"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] ml-1">Date de naissance</label>
                            <input
                                type="date"
                                value={data.date_of_birth}
                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                className="w-full bg-[#161b2e] border border-white/10 py-5 px-6 rounded-3xl focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-white font-black italic shadow-inner"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] ml-1">Métier / Profession</label>
                            <input
                                type="text"
                                value={data.job}
                                onChange={(e) => setData('job', e.target.value)}
                                placeholder="Ex: Architecte, Entrepreneur..."
                                className="w-full bg-[#161b2e] border border-white/10 py-5 px-6 rounded-3xl focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all placeholder:text-gray-700 text-white font-black italic shadow-inner"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] ml-1">Je suis</label>
                            <div className="grid grid-cols-2 gap-5">
                                {['Homme', 'Femme'].map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setData('gender', opt)}
                                        className={`py-5 rounded-3xl font-black uppercase tracking-widest transition-all border italic ${data.gender === opt
                                            ? 'bg-[#D4AF37] text-[#101322] border-[#D4AF37] shadow-2xl shadow-[#D4AF37]/20 scale-[1.02]'
                                            : 'bg-[#161b2e] text-gray-500 border-white/10 hover:border-[#D4AF37]/50'
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
                            className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 ${!data.name || !data.date_of_birth || !data.gender
                                ? 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'
                                : 'bg-[#D4AF37] text-[#101322] border border-[#D4AF37] hover:brightness-110 shadow-[#D4AF37]/20 uppercase italic font-black'
                                }`}
                        >
                            Suivant
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
