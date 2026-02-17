import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function EditProfile({ user }) {
    const [availableInterests, setAvailableInterests] = useState([]);
    const [suggestion, setSuggestion] = useState('');
    const [suggesting, setSuggesting] = useState(false);
    const [visibleCount, setVisibleCount] = useState(10);
    const [suggestionSuccess, setSuggestionSuccess] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        name: user.name || '',
        bio: user.bio || '',
        job: user.job || '',
        education: user.education || '',
        height: user.height || '',
        city: user.city || '',
        interests: user.interests || [],
        languages: user.languages || [],
        avatar_data: null,
    });

    const [previewUrl, setPreviewUrl] = useState(user.avatar);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setData('avatar_data', reader.result);
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        axios.get('/api/interests').then(res => {
            setAvailableInterests(res.data);
        });
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'));
    };

    const handleSuggest = async (e) => {
        e.preventDefault();
        if (!suggestion) return;
        setSuggesting(true);
        try {
            await axios.post('/api/interests/suggest', { label: suggestion });
            setSuggestionSuccess('Tag suggéré avec succès !');
            setSuggestion('');
            setTimeout(() => setSuggestionSuccess(''), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setSuggesting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] text-[#101322] dark:text-white font-sans pb-32 overflow-x-hidden transition-colors duration-500">
            <Head title={`Modifier le profil - ${data.name}`} />

            <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#101322]/90 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 transition-all duration-500">
                <Link href={route('profile', 'me')} className="w-10 h-10 flex items-center justify-start">
                    <span className="material-symbols-outlined text-[#101322] dark:text-white transition-colors duration-500">arrow_back_ios</span>
                </Link>
                <h1 className="text-lg font-bold text-[#101322] dark:text-white transition-colors duration-500">Modifier le profil</h1>
                <button
                    onClick={submit}
                    disabled={processing}
                    className="bg-[#D4AF37] text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-sm shadow-[#D4AF37]/20 active:scale-95 transition-transform disabled:opacity-50"
                >
                    {processing ? '...' : 'Enregistrer'}
                </button>
            </header>

            <main className="max-w-lg mx-auto pb-12">
                {/* Photo Section - Hero Style */}
                <div className="relative w-full h-80 bg-gray-100 dark:bg-gray-800 transition-colors duration-500 overflow-hidden">
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${previewUrl || 'https://via.placeholder.com/600'})` }}
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute bottom-6 right-6 flex flex-col gap-3 items-end">
                        <Link href={route('photos.manage')} className="bg-white/90 dark:bg-[#1a1f35]/90 backdrop-blur-md px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-xl border border-black/5 dark:border-white/10 text-[#D4AF37] active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-lg">collections</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Gérer</span>
                        </Link>
                        <label className="w-12 h-12 bg-white dark:bg-[#1a1f35] rounded-full flex items-center justify-center shadow-xl border-4 border-white/20 dark:border-white/5 text-[#D4AF37] cursor-pointer active:scale-95 transition-transform transition-colors duration-500">
                            <span className="material-symbols-outlined">add_a_photo</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                    </div>
                </div>

                <div className="px-6 -mt-4 relative z-10">
                    <div className="space-y-6">
                        {/* Bio Section */}
                        <div className="bg-white dark:bg-[#161b2e] p-5 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 transition-colors duration-500">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 transition-colors duration-500">À propos de moi</label>
                            <textarea
                                value={data.bio}
                                onChange={e => setData('bio', e.target.value)}
                                className="w-full border-none p-0 focus:ring-0 text-[#101322] dark:text-gray-100 bg-transparent resize-none min-h-[100px] text-sm leading-relaxed italic transition-colors duration-500"
                                placeholder="Dites-en plus sur vous..."
                            />
                        </div>

                        {/* Profession & Education */}
                        <div className="bg-white dark:bg-[#161b2e] p-5 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 space-y-4 transition-colors duration-500">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 transition-colors duration-500">Profession / Job</label>
                                <input
                                    className="w-full border-none p-0 focus:ring-0 text-[#101322] dark:text-gray-100 bg-transparent text-sm font-bold transition-colors duration-500"
                                    type="text"
                                    value={data.job}
                                    onChange={e => setData('job', e.target.value)}
                                />
                            </div>
                            <div className="h-px bg-gray-50 dark:bg-white/5"></div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 transition-colors duration-500">Éducation</label>
                                <input
                                    className="w-full border-none p-0 focus:ring-0 text-[#101322] dark:text-gray-100 bg-transparent text-sm font-bold transition-colors duration-500"
                                    type="text"
                                    value={data.education}
                                    onChange={e => setData('education', e.target.value)}
                                />
                            </div>
                            <div className="h-px bg-gray-50 dark:bg-white/5"></div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 transition-colors duration-500">Taille (cm)</label>
                                <input
                                    className="w-full border-none p-0 focus:ring-0 text-[#101322] dark:text-gray-100 bg-transparent text-sm font-bold transition-colors duration-500"
                                    type="number"
                                    value={data.height}
                                    onChange={e => setData('height', e.target.value)}
                                    placeholder="Ex: 175"
                                />
                            </div>
                        </div>

                        {/* Interests Grid */}
                        <div className="bg-white dark:bg-[#161b2e] p-5 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 transition-colors duration-500">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 transition-colors duration-500">Centres d'intérêt ({data.interests.length}/10)</label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableInterests.slice(0, visibleCount).map((interest) => (
                                    <button
                                        key={interest.id}
                                        type="button"
                                        onClick={() => {
                                            const newInterests = data.interests.includes(interest.label)
                                                ? data.interests.filter(i => i !== interest.label)
                                                : data.interests.length < 10 ? [...data.interests, interest.label] : data.interests;
                                            setData('interests', newInterests);
                                        }}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border transition-colors duration-500 ${data.interests.includes(interest.label)
                                            ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30'
                                            : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 border-black/5 dark:border-white/5'
                                            }`}
                                    >
                                        {interest.label}
                                    </button>
                                ))}
                                {visibleCount < availableInterests.length && (
                                    <button
                                        type="button"
                                        onClick={() => setVisibleCount(prev => prev + 10)}
                                        className="px-4 py-1.5 rounded-full text-xs font-bold border border-[#D4AF37] text-[#D4AF37] italic hover:bg-[#D4AF37] hover:text-[#101322] transition-all"
                                    >
                                        + Afficher plus
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Verified Badge Status */}
                        <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-[#D4AF37] text-sm">Profil Vérifié</h4>
                                <p className="text-xs text-[#D4AF37]/70">Votre badge premium est visible par tous.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}
