import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthProvider';

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
    const navigate = useNavigate();
    const { login } = useAuth();
    const [data, setData] = useState({
        intention: '',
    });
    const [processing, setProcessing] = useState(false);

    const updateData = (key, value) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const response = await axios.post('/api/onboarding/intentions', data);

            if (response.data.user) {
                const token = localStorage.getItem('auth_token');
                login(token, response.data.user);
            }

            const nextStep = response.data.next_step || 'interests';
            navigate(`/onboarding/${nextStep}`);
        } catch (error) {
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] flex flex-col p-6 text-[#101322] dark:text-white font-['Be_Vietnam_Pro'] relative overflow-hidden transition-colors duration-500">
            {/* Benin Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(#E1AD01 0.5px, transparent 0.5px)',
                    backgroundSize: '24px 24px'
                }}>
            </div>

            {/* Header / Progress bar */}
            <div className="w-full pt-6 pb-10 flex items-center justify-between z-10 transition-all duration-500">
                <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#161b2e] border border-black/5 dark:border-white/10 active:scale-90 transition-all transition-colors duration-500 shadow-sm dark:shadow-none">
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm">arrow_back_ios</span>
                </button>
                <div className="flex-1 mx-8 h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5 transition-colors duration-500">
                    <div className="w-2/5 h-full bg-[#D4AF37] rounded-full shadow-lg shadow-[#D4AF37]/30 transition-all duration-500"></div>
                </div>
                <span className="text-[10px] font-black text-[#D4AF37] tracking-[0.2em] leading-none uppercase italic">02/05</span>
            </div>

            <div className="flex-1 flex flex-col space-y-10 z-10">
                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tighter text-[#101322] dark:text-white leading-none italic uppercase transition-colors duration-500">
                        Que recherchez- <br /> vous vraiment ?
                    </h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm font-medium leading-relaxed italic transition-colors duration-500">Choisissez votre intention maîtresse <br /> pour des rencontres qui vous ressemblent.</p>
                </div>

                <div className="space-y-5 overflow-y-auto max-h-[55vh] pb-4 px-1">
                    {intentions.map((intent) => (
                        <button
                            key={intent.id}
                            onClick={() => updateData('intention', intent.id)}
                            className={`w-full text-left p-6 bg-white dark:bg-[#161b2e] border-2 rounded-[2rem] transition-all relative transition-colors duration-500 shadow-sm dark:shadow-none ${data.intention === intent.id
                                ? `border-[#D4AF37] bg-[#D4AF37]/5 shadow-2xl shadow-[#D4AF37]/5 scale-[1.02]`
                                : 'border-black/5 dark:border-white/5 hover:border-[#D4AF37]/30'
                                }`}
                        >
                            <div className="flex items-start space-x-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 transition-colors duration-500`}>
                                    {intent.icon}
                                </div>
                                <div className="flex-1 pr-8">
                                    <h3 className="font-black text-[#101322] dark:text-white italic uppercase text-xs tracking-widest transition-colors duration-500">{intent.label}</h3>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 leading-relaxed font-medium italic transition-colors duration-500">{intent.description}</p>
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

                <div className="bg-[#D4AF37]/5 p-5 rounded-[2rem] flex items-start space-x-4 mt-auto border border-[#D4AF37]/10 transition-colors duration-500">
                    <div className="text-[#D4AF37] mt-1">
                        <span className="material-symbols-outlined text-xl">verified_user</span>
                    </div>
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 leading-relaxed font-black uppercase tracking-wider italic transition-colors duration-500">
                        Votre intention est exclusivement visible par les membres vérifiés pour garantir <br /> l'intégrité de la communauté Lumi Benin.
                    </p>
                </div>

                <div className="pb-10">
                    <button
                        disabled={!data.intention || processing}
                        onClick={handleSubmit}
                        className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 transition-colors duration-500 ${!data.intention || processing
                            ? 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-white/20 cursor-not-allowed border border-black/5 dark:border-white/5 shadow-none'
                            : 'bg-[#D4AF37] text-white dark:text-[#101322] border border-[#D4AF37] hover:brightness-110 shadow-[#D4AF37]/20 uppercase italic font-black shadow-[#D4AF37]/30'
                            }`}
                    >
                        {processing ? (
                            <div className="w-6 h-6 border-2 border-[#101322]/30 border-t-[#101322] rounded-full animate-spin mx-auto"></div>
                        ) : (
                            'Suivant'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
