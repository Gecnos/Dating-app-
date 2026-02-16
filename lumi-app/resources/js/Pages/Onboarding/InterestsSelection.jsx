import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import axios from 'axios';

export default function InterestsSelection() {
    const [availableInterests, setAvailableInterests] = useState([]);
    const [suggestion, setSuggestion] = useState('');
    const [suggesting, setSuggesting] = useState(false);
    const [suggestionSuccess, setSuggestionSuccess] = useState('');

    const { data, setData, post, processing } = useForm({
        interests: [],
    });

    useEffect(() => {
        axios.get('/api/interests').then(res => {
            setAvailableInterests(res.data);
        });
    }, []);

    const toggleTag = (label) => {
        const newInterests = data.interests.includes(label)
            ? data.interests.filter((i) => i !== label)
            : data.interests.length < 5 ? [...data.interests, label] : data.interests;
        setData('interests', newInterests);
    };

    const handleSuggest = async (e) => {
        e.preventDefault();
        if (!suggestion) return;
        setSuggesting(true);
        try {
            await axios.post('/api/interests/suggest', { label: suggestion });
            setSuggestionSuccess('Suggestion envoyée !');
            setSuggestion('');
            setTimeout(() => setSuggestionSuccess(''), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setSuggesting(false);
        }
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

            {/* Header / Progress bar */}
            <div className="w-full pt-6 pb-10 flex items-center justify-between z-10">
                <button onClick={() => window.history.back()} className="size-10 flex items-center justify-center rounded-xl bg-[#161b2e] border border-white/10 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-gray-400 text-sm">arrow_back_ios</span>
                </button>
                <div className="flex-1 mx-8 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="w-3/5 h-full bg-[#D4AF37] rounded-full shadow-lg shadow-[#D4AF37]/30"></div>
                </div>
                <span className="text-[10px] font-black text-[#D4AF37] tracking-[0.2em] leading-none uppercase italic">03/05</span>
            </div>

            <div className="flex-1 flex flex-col space-y-8 z-10">
                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tighter text-white leading-none italic uppercase">
                        Tes centres <br /> d'intérêt
                    </h1>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed italic">Choisissez entre 3 et 5 tags pour affiner <br /> vos affinités exclusives.</p>
                </div>

                <div className="flex flex-wrap gap-3 pt-4">
                    {availableInterests.map((tag) => (
                        <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.label)}
                            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border italic ${data.interests.includes(tag.label)
                                ? 'bg-[#D4AF37] text-[#101322] border-[#D4AF37] shadow-xl shadow-[#D4AF37]/20 scale-[1.05]'
                                : 'bg-[#161b2e] text-gray-500 border-white/10 hover:border-white/20'
                                }`}
                        >
                            {tag.label}
                        </button>
                    ))}
                </div>

                {/* Suggestion Section */}
                <div className="pt-8 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">Un intérêt manque à l'appel ?</p>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={suggestion}
                            onChange={e => setSuggestion(e.target.value)}
                            placeholder="Suggérer un intérêt..."
                            className="flex-1 bg-[#161b2e] border border-white/10 rounded-2xl px-5 py-4 text-xs focus:ring-1 focus:ring-[#D4AF37] outline-none text-white italic font-medium shadow-inner"
                        />
                        <button
                            onClick={handleSuggest}
                            disabled={suggesting || !suggestion}
                            className="bg-[#D4AF37] text-[#101322] px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95"
                        >
                            {suggesting ? '...' : 'Suggérer'}
                        </button>
                    </div>
                    {suggestionSuccess && <p className="text-green-500 text-[10px] font-black uppercase italic tracking-widest">{suggestionSuccess}</p>}
                </div>

                <div className="mt-auto pb-10 space-y-8">
                    <div className="text-center">
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] italic ${data.interests.length >= 3 ? 'text-[#D4AF37]' : 'text-gray-600'}`}>
                            {data.interests.length} / 5 sélectionnés
                        </span>
                    </div>
                    <button
                        disabled={data.interests.length < 3}
                        onClick={handleSubmit}
                        className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 ${data.interests.length < 3
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
