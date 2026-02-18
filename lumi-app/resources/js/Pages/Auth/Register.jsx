import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import axios from 'axios';

export default function Register() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleRegister = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const response = await axios.post('/api/register', data);
            const { token, user, onboarding_step } = response.data;

            login(token, user);
            navigate(`/onboarding/${onboarding_step}`);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                alert(err.response?.data?.message || 'Une erreur est survenue.');
            }
        } finally {
            setProcessing(false);
        }
    };

    const updateData = (key, value) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="min-h-screen bg-[#101322] font-['Be_Vietnam_Pro'] antialiased overflow-x-hidden text-white flex flex-col relative">
            {/* Benin Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(#E1AD01 0.5px, transparent 0.5px)',
                    backgroundSize: '24px 24px'
                }}>
            </div>

            {/* Top Navigation Bar */}
            <div className="flex items-center bg-transparent p-4 justify-between z-10">
                <Link
                    to="/login"
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 shadow-sm backdrop-blur-sm hover:bg-white/20 transition-all"
                >
                    <span className="material-symbols-outlined text-white">arrow_back</span>
                </Link>
                <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">Inscription</h2>
            </div>

            {/* Form Section */}
            <div className="flex-1 px-6 pt-8 z-10 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-[#E1AD01] mb-2">Rejoignez Lumi</h1>
                    <p className="text-white/40 text-sm">Créez votre compte premium en quelques secondes.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#E1AD01] uppercase tracking-[0.2em] ml-1">Nom complet</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => updateData('name', e.target.value)}
                            className={`w-full h-14 bg-white/5 border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 text-white placeholder:text-white/10 focus:outline-none focus:border-[#E1AD01]/50 transition-all font-medium`}
                            placeholder="Ex: Koffi Bénin"
                            required
                        />
                        {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#E1AD01] uppercase tracking-[0.2em] ml-1">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => updateData('email', e.target.value)}
                            className={`w-full h-14 bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 text-white placeholder:text-white/10 focus:outline-none focus:border-[#E1AD01]/50 transition-all font-medium`}
                            placeholder="votre@email.com"
                            required
                        />
                        {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.email}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#E1AD01] uppercase tracking-[0.2em] ml-1">Mot de passe</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={e => updateData('password', e.target.value)}
                            className={`w-full h-14 bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 text-white placeholder:text-white/10 focus:outline-none focus:border-[#E1AD01]/50 transition-all font-medium`}
                            placeholder="Min. 8 caractères"
                            required
                        />
                        {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.password}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#E1AD01] uppercase tracking-[0.2em] ml-1">Confirmer mot de passe</label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={e => updateData('password_confirmation', e.target.value)}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white placeholder:text-white/10 focus:outline-none focus:border-[#E1AD01]/50 transition-all font-medium"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="flex items-center justify-center gap-3 rounded-full h-15 px-5 bg-[#E1AD01] text-[#111218] text-base font-black w-full shadow-xl shadow-[#E1AD01]/20 active:scale-[0.98] transition-all mt-8"
                    >
                        {processing ? (
                            <div className="w-6 h-6 border-2 border-[#111218]/30 border-t-[#111218] rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
                                <span>Créer mon compte</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center pb-10">
                    <p className="text-white/40 text-sm">
                        Déjà inscrit ?{' '}
                        <Link to="/login" className="text-[#E1AD01] font-bold hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>

            {/* iOS Home Indicator Spacer */}
            <div className="h-8 w-full"></div>
        </div>
    );
}
