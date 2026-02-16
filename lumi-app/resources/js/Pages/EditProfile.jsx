import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import NavigationBar from '@/Components/NavigationBar';
import { motion } from 'framer-motion';

export default function EditProfile({ user }) {
    const { data, setData, post, processing, errors } = useForm({
        name: user.name || '',
        bio: user.bio || '',
        job: user.job || '',
        education: user.education || '',
        height: user.height || '',
        city: user.city || '',
        interests: user.interests || [],
        languages: user.languages || [],
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'));
    };

    const sections = [
        { label: 'Informations de base', fields: ['name', 'bio'] },
        { label: 'Carrière & Études', fields: ['job', 'education'] },
        { label: 'Physique & Localisation', fields: ['height', 'city'] },
    ];

    return (
        <div className="min-h-screen bg-[#101322] text-white font-sans pb-32">
            <Head title="Modifier mon profil" />

            <header className="sticky top-0 z-50 bg-[#101322]/90 backdrop-blur-xl px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <Link href={route('profile', 'me')} className="size-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10">
                    <span className="material-symbols-outlined text-gray-400">arrow_back</span>
                </Link>
                <h1 className="text-xl font-black italic tracking-tighter">Édition Profil</h1>
                <button
                    onClick={submit}
                    disabled={processing}
                    className="px-6 py-2 rounded-full bg-[#D4AF37] text-[#101322] text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                >
                    {processing ? 'Envoi...' : 'Enregistrer'}
                </button>
            </header>

            <main className="max-w-md mx-auto p-6 space-y-10">
                {/* Photo Section Placeholder */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Photos de profil (Max 6)</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="aspect-[3/4] rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center relative overflow-hidden group">
                                {user.photos?.[i] ? (
                                    <img src={user.photos[i].url} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-white/20 group-hover:text-[#D4AF37] transition-colors">add_a_photo</span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <form onSubmit={submit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nom d'affichage</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
                                placeholder="Votre nom"
                            />
                            {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Bio / Ma Philosophie</label>
                            <textarea
                                value={data.bio}
                                onChange={e => setData('bio', e.target.value)}
                                rows="4"
                                className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm font-medium focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all resize-none ${errors.bio ? 'border-red-500' : 'border-white/10'}`}
                                placeholder="Dites-en un peu plus sur vous..."
                            />
                            {errors.bio && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.bio}</p>}
                        </div>
                    </div>

                    {/* Secondary attributes */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Métier</label>
                            <input
                                type="text"
                                value={data.job}
                                onChange={e => setData('job', e.target.value)}
                                className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm font-bold ${errors.job ? 'border-red-500' : 'border-white/10'}`}
                                placeholder="Ex: Designer"
                            />
                            {errors.job && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.job}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Taille (cm)</label>
                            <input
                                type="number"
                                value={data.height}
                                onChange={e => setData('height', e.target.value)}
                                className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm font-bold ${errors.height ? 'border-red-500' : 'border-white/10'}`}
                                placeholder="Ex: 175"
                            />
                            {errors.height && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.height}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Études / Établissement</label>
                        <input
                            type="text"
                            value={data.education}
                            onChange={e => setData('education', e.target.value)}
                            className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm font-bold ${errors.education ? 'border-red-500' : 'border-white/10'}`}
                            placeholder="Ex: Master en Droit"
                        />
                        {errors.education && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.education}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Ville actuelle</label>
                        <input
                            type="text"
                            value={data.city}
                            onChange={e => setData('city', e.target.value)}
                            className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm font-bold ${errors.city ? 'border-red-500' : 'border-white/10'}`}
                            placeholder="Ex: Cotonou, Haie Vive"
                        />
                        {errors.city && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.city}</p>}
                    </div>

                    {/* Interests Tag Cloud Placeholder */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Centres d'intérêt</h3>
                            {errors.interests && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.interests}</p>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['Sport', 'Musique', 'Voyages', 'Cinéma', 'Cuisine', 'Art'].map((interest) => (
                                <button
                                    key={interest}
                                    type="button"
                                    className={`px-5 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider border transition-all ${data.interests.includes(interest) ? 'bg-[#D4AF37] text-[#101322] border-[#D4AF37]' : 'bg-white/5 text-gray-400 border-white/10'}`}
                                    onClick={() => {
                                        const newInterests = data.interests.includes(interest)
                                            ? data.interests.filter(i => i !== interest)
                                            : [...data.interests, interest];
                                        setData('interests', newInterests);
                                    }}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>
                </form>
            </main>

            <NavigationBar />
        </div>
    );
}
