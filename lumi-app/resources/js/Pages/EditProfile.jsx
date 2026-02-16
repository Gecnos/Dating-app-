import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function EditProfile({ user }) {
    const [availableInterests, setAvailableInterests] = useState([]);
    const [suggestion, setSuggestion] = useState('');
    const [suggesting, setSuggesting] = useState(false);
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
        <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#101322] text-[#111218] dark:text-white font-sans pb-32 overflow-x-hidden">
            <Head title={`Modifier le profil - ${data.name}`} />

            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#101322]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <Link href={route('profile', 'me')} className="w-10 h-10 flex items-center justify-start">
                    <span className="material-symbols-outlined text-gray-800 dark:text-white">arrow_back_ios</span>
                </Link>
                <h1 className="text-lg font-bold">Modifier le profil</h1>
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
                <div className="relative w-full h-80 bg-gray-200 dark:bg-gray-800">
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${previewUrl || 'https://via.placeholder.com/600'})` }}
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <label className="absolute bottom-6 right-6 w-12 h-12 bg-white dark:bg-[#1a1f35] rounded-full flex items-center justify-center shadow-xl border-4 border-white/20 text-[#D4AF37] cursor-pointer active:scale-95 transition-transform">
                        <span className="material-symbols-outlined">add_a_photo</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </label>
                </div>

                <div className="px-6 -mt-4 relative z-10">
                    <div className="space-y-6">
                        {/* Bio Section */}
                        <div className="bg-white dark:bg-[#161b2e] p-5 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-800">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">À propos de moi</label>
                            <textarea
                                value={data.bio}
                                onChange={e => setData('bio', e.target.value)}
                                className="w-full border-none p-0 focus:ring-0 text-gray-800 dark:text-gray-100 bg-transparent resize-none min-h-[100px] text-sm leading-relaxed italic"
                                placeholder="Dites-en plus sur vous..."
                            />
                        </div>

                        {/* Profession & Education */}
                        <div className="bg-white dark:bg-[#161b2e] p-5 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-800 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Profession / Job</label>
                                <input
                                    className="w-full border-none p-0 focus:ring-0 text-gray-800 dark:text-gray-100 bg-transparent text-sm font-bold"
                                    type="text"
                                    value={data.job}
                                    onChange={e => setData('job', e.target.value)}
                                />
                            </div>
                            <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Éducation</label>
                                <input
                                    className="w-full border-none p-0 focus:ring-0 text-gray-800 dark:text-gray-100 bg-transparent text-sm font-bold"
                                    type="text"
                                    value={data.education}
                                    onChange={e => setData('education', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Interests Grid */}
                        <div className="bg-white dark:bg-[#161b2e] p-5 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-800">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Centres d'intérêt ({data.interests.length}/5)</label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableInterests.map((interest) => (
                                    <button
                                        key={interest.id}
                                        type="button"
                                        onClick={() => {
                                            const newInterests = data.interests.includes(interest.label)
                                                ? data.interests.filter(i => i !== interest.label)
                                                : data.interests.length < 5 ? [...data.interests, interest.label] : data.interests;
                                            setData('interests', newInterests);
                                        }}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${data.interests.includes(interest.label)
                                            ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30'
                                            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-transparent'
                                            }`}
                                    >
                                        {interest.label}
                                    </button>
                                ))}
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
