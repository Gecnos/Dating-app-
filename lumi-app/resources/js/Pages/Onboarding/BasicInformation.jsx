import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import axios from 'axios';

export default function BasicInformation() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [data, setData] = useState({
        name: '',
        date_of_birth: '',
        gender: '',
        job: '',
        height: '',
    });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (user) {
            setData({
                name: user.name || '',
                date_of_birth: user.date_of_birth || '',
                gender: user.gender || '',
                job: user.job || '',
                height: user.height || '',
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const response = await axios.post('/api/onboarding/basic', data);

            // Update local user context if API returns updated user
            if (response.data.user) {
                // We might need a method to update user without full login, but login works too if we have token
                // Or just update the user object in context
                // current implementation of login expects (token, user)
                // We can re-use the token we have
                const token = localStorage.getItem('auth_token');
                login(token, response.data.user);
            }

            const nextStep = response.data.next_step || 'intentions';
            navigate(`/onboarding/${nextStep}`);
        } catch (error) {
            console.error(error);
            // Handle errors (display toast or alert)
        } finally {
            setProcessing(false);
        }
    };

    const updateData = (key, value) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] flex flex-col p-6 text-[#101322] dark:text-white font-['Be_Vietnam_Pro'] relative overflow-hidden transition-colors duration-500">
            {/* Benin Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(#D4AF37 0.5px, transparent 0.5px)',
                    backgroundSize: '24px 24px'
                }}>
            </div>

            {/* Header / Progress bar */}
            <div className="w-full pt-6 pb-10 flex items-center justify-between z-10 transition-all duration-500">
                <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#161b2e] border border-black/5 dark:border-white/10 active:scale-90 transition-all transition-colors duration-500 shadow-sm dark:shadow-none">
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm">arrow_back_ios</span>
                </button>
                <div className="flex-1 mx-8 h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5 transition-colors duration-500">
                    <div className="w-1/5 h-full bg-[#D4AF37] rounded-full shadow-lg shadow-[#D4AF37]/30 transition-all duration-500"></div>
                </div>
                <span className="text-[10px] font-black text-[#D4AF37] tracking-[0.2em] leading-none uppercase italic">01/05</span>
            </div>

            <div className="flex-1 flex flex-col space-y-12 z-10">
                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tighter text-[#101322] dark:text-white leading-none italic uppercase transition-colors duration-500">
                        Parle-nous <br /> de toi
                    </h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm font-medium leading-relaxed italic transition-colors duration-500">Ces précieux détails nous aident à trouver <br /> l'élite qui vous correspond.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10 flex-1 flex flex-col">
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] ml-1">Prénom ou Pseudo</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => updateData('name', e.target.value)}
                                placeholder="Ex: Koffi"
                                className="w-full bg-white dark:bg-[#161b2e] border border-black/5 dark:border-white/10 py-5 px-6 rounded-3xl focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700 text-[#101322] dark:text-white font-black italic shadow-sm dark:shadow-inner transition-colors duration-500"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] ml-1">Date de naissance</label>
                            <input
                                type="date"
                                value={data.date_of_birth}
                                onChange={(e) => updateData('date_of_birth', e.target.value)}
                                className="w-full bg-white dark:bg-[#161b2e] border border-black/5 dark:border-white/10 py-5 px-6 rounded-3xl focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-[#101322] dark:text-white font-black italic shadow-sm dark:shadow-inner transition-colors duration-500"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] ml-1">Métier / Profession</label>
                            <input
                                type="text"
                                value={data.job}
                                onChange={(e) => updateData('job', e.target.value)}
                                placeholder="Ex: Architecte, Entrepreneur..."
                                className="w-full bg-white dark:bg-[#161b2e] border border-black/5 dark:border-white/10 py-5 px-6 rounded-3xl focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700 text-[#101322] dark:text-white font-black italic shadow-sm dark:shadow-inner transition-colors duration-500"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] ml-1">Taille (cm)</label>
                            <input
                                type="number"
                                value={data.height}
                                onChange={(e) => updateData('height', e.target.value)}
                                placeholder="Ex: 175"
                                className="w-full bg-white dark:bg-[#161b2e] border border-black/5 dark:border-white/10 py-5 px-6 rounded-3xl focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700 text-[#101322] dark:text-white font-black italic shadow-sm dark:shadow-inner transition-colors duration-500"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] ml-1">Je suis</label>
                            <div className="grid grid-cols-2 gap-5">
                                {['Homme', 'Femme'].map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => updateData('gender', opt)}
                                        className={`py-5 rounded-3xl font-black uppercase tracking-widest transition-all border italic transition-colors duration-500 ${data.gender === opt
                                            ? 'bg-[#D4AF37] text-white dark:text-[#101322] border-[#D4AF37] shadow-2xl shadow-[#D4AF37]/20 scale-[1.02]'
                                            : 'bg-white dark:bg-[#161b2e] text-gray-400 dark:text-gray-500 border-black/5 dark:border-white/10 hover:border-[#D4AF37]/50 shadow-sm dark:shadow-none font-bold'
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
                            disabled={!data.name || !data.date_of_birth || !data.gender || processing}
                            className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 transition-colors duration-500 ${!data.name || !data.date_of_birth || !data.gender || processing
                                ? 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-white/10 cursor-not-allowed border border-black/5 dark:border-white/5 shadow-none'
                                : 'bg-[#D4AF37] text-white dark:text-[#101322] border border-[#D4AF37] hover:brightness-110 shadow-[#D4AF37]/20 uppercase italic font-black'
                                }`}
                        >
                            {processing ? (
                                <div className="w-6 h-6 border-2 border-[#101322]/30 border-t-[#101322] rounded-full animate-spin mx-auto"></div>
                            ) : (
                                'Suivant'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
