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
                <div className="space-y-4">
                    <h1 className="text-3xl font-black tracking-tight text-white leading-tight">Tes centres d'intérêt</h1>
                    <p className="text-white/60 text-sm font-medium leading-relaxed">Choisis de 3 à 5 tags pour affiner les affinités avec d'autres membres au Bénin.</p>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-4">
                    {availableInterests.map((tag) => (
                        <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.label)}
                            className={`px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all border ${data.interests.includes(tag.label)
                                ? 'bg-[#E1AD01] text-[#101322] border-[#E1AD01] shadow-xl shadow-[#E1AD01]/20 scale-[1.05]'
                                : 'bg-white/5 text-white/50 border-white/5 hover:border-white/20'
                                }`}
                        >
                            {tag.label}
                        </button>
                    ))}
                </div>

                {/* Suggestion Section */}
                <div className="pt-6 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">L'intérêt n'est pas dans la liste ?</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={suggestion}
                            onChange={e => setSuggestion(e.target.value)}
                            placeholder="Suggérer un intérêt..."
                            className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#E1AD01] outline-none"
                        />
                        <button
                            onClick={handleSuggest}
                            disabled={suggesting || !suggestion}
                            className="bg-white/10 hover:bg-white/20 px-4 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                        >
                            {suggesting ? '...' : 'Suggérer'}
                        </button>
                    </div>
                    {suggestionSuccess && <p className="text-green-400 text-[10px] font-bold uppercase">{suggestionSuccess}</p>}
                </div>

                <div className="mt-auto pb-8 space-y-6">
                    <div className="text-center">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${data.interests.length >= 3 ? 'text-[#E1AD01]' : 'text-white/40'}`}>
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
