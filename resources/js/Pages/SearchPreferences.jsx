import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthProvider';
import { useToast } from '../contexts/ToastContext';

export default function SearchPreferences() {
    const navigate = useNavigate();
    const { user: authUser, setUser: setAuthUser } = useAuth();
    const { success, error } = useToast();

    const [ageMin, setAgeMin] = useState(authUser?.pref_age_min ?? '');
    const [ageMax, setAgeMax] = useState(authUser?.pref_age_max ?? '');
    const [maxDistance, setMaxDistance] = useState(authUser?.pref_max_distance_km ?? '');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSave = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const res = await axios.post('/preferences/search', {
                pref_age_min: ageMin === '' ? null : Number(ageMin),
                pref_age_max: ageMax === '' ? null : Number(ageMax),
                pref_max_distance_km: maxDistance === '' ? null : Number(maxDistance),
            });

            if (setAuthUser && authUser) {
                setAuthUser({ ...authUser, ...res.data.preferences });
            }
            success('Préférences enregistrées.');
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                error('Échec de la sauvegarde des préférences.');
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] text-[#101322] dark:text-white font-['Be_Vietnam_Pro'] pb-32 overflow-x-hidden transition-colors duration-500">
            <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b bg-white/90 dark:bg-[#101322]/90 border-black/5 dark:border-white/10 backdrop-blur-xl transition-all duration-500">
                <button onClick={() => navigate('/settings')} className="w-10 h-10 flex items-center justify-start">
                    <span className="material-symbols-outlined text-[#101322] dark:text-white transition-colors duration-500">arrow_back_ios</span>
                </button>
                <h1 className="text-lg font-bold text-[#101322] dark:text-white transition-colors duration-500">Préférences de recherche</h1>
                <div className="w-10" />
            </header>

            <main className="max-w-lg mx-auto p-6 space-y-8">
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Ces réglages filtrent les profils qui vous sont proposés dans la découverte. Laissez un champ vide pour ne pas filtrer dessus.
                </p>

                <form onSubmit={handleSave} className="space-y-8">
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-2 transition-colors duration-500">Tranche d'âge</h3>
                        <div className="rounded-3xl border bg-white dark:bg-[#161b2e] border-black/5 dark:border-white/5 shadow-sm p-5 flex items-center gap-4 transition-colors duration-500">
                            <div className="flex-1">
                                <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Min</label>
                                <input
                                    type="number"
                                    min="18"
                                    max="99"
                                    value={ageMin}
                                    onChange={(e) => setAgeMin(e.target.value)}
                                    placeholder="18"
                                    className="w-full mt-1 bg-transparent border-0 border-b border-black/10 dark:border-white/10 focus:ring-0 focus:border-[#D4AF37] text-sm font-bold py-1"
                                />
                            </div>
                            <span className="text-gray-400 mt-4">—</span>
                            <div className="flex-1">
                                <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Max</label>
                                <input
                                    type="number"
                                    min="18"
                                    max="99"
                                    value={ageMax}
                                    onChange={(e) => setAgeMax(e.target.value)}
                                    placeholder="99"
                                    className="w-full mt-1 bg-transparent border-0 border-b border-black/10 dark:border-white/10 focus:ring-0 focus:border-[#D4AF37] text-sm font-bold py-1"
                                />
                            </div>
                        </div>
                        {errors.pref_age_min && <p className="text-red-500 text-[10px] ml-2">{errors.pref_age_min[0]}</p>}
                        {errors.pref_age_max && <p className="text-red-500 text-[10px] ml-2">{errors.pref_age_max[0]}</p>}
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-2 transition-colors duration-500">Distance maximum</h3>
                        <div className="rounded-3xl border bg-white dark:bg-[#161b2e] border-black/5 dark:border-white/5 shadow-sm p-5 flex items-center gap-3 transition-colors duration-500">
                            <input
                                type="number"
                                min="1"
                                value={maxDistance}
                                onChange={(e) => setMaxDistance(e.target.value)}
                                placeholder="Illimitée"
                                className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold py-1"
                            />
                            <span className="text-xs text-gray-400 font-bold shrink-0">km</span>
                        </div>
                        {errors.pref_max_distance_km && <p className="text-red-500 text-[10px] ml-2">{errors.pref_max_distance_km[0]}</p>}
                    </section>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 rounded-2xl bg-[#D4AF37] text-[#101322] font-black text-xs uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                    >
                        {processing ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </form>
            </main>
        </div>
    );
}
