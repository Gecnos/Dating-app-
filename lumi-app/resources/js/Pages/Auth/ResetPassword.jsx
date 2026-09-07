import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { success: toastSuccess, error: toastError } = useToast();

    const token = params.get('token') || '';
    const email = params.get('email') || '';

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (password !== passwordConfirmation) {
            setErrors({ password_confirmation: ['Les mots de passe ne correspondent pas.'] });
            return;
        }

        setProcessing(true);
        try {
            await axios.post('/password/reset', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            toastSuccess('Mot de passe réinitialisé, vous pouvez vous connecter.');
            navigate('/login');
        } catch (err) {
            if (err.response?.status === 422 && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                toastError(err.response?.data?.message || 'Une erreur est survenue.');
            }
        } finally {
            setProcessing(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#101322] flex flex-col items-center justify-center text-center px-6 text-[#101322] dark:text-white transition-colors duration-500">
                <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
                <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">Lien invalide</h3>
                <p className="text-gray-500 text-sm mb-6">Ce lien de réinitialisation est incomplet ou invalide.</p>
                <Link to="/forgot-password" className="text-[#D4AF37] text-xs font-black uppercase tracking-widest hover:underline">
                    Demander un nouveau lien
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] font-['Be_Vietnam_Pro'] antialiased overflow-x-hidden text-[#101322] dark:text-white flex flex-col relative transition-colors duration-500">
            {/* Benin Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(#E1AD01 0.5px, transparent 0.5px)',
                    backgroundSize: '24px 24px'
                }}>
            </div>

            {/* Top Navigation Bar */}
            <div className="flex items-center bg-transparent p-6 justify-between z-10">
                <Link
                    to="/login"
                    className="flex items-center justify-center size-12 rounded-2xl bg-[#161b2e] border border-white/10 shadow-xl active:scale-90 transition-all"
                >
                    <span className="material-symbols-outlined text-gray-400">arrow_back</span>
                </Link>
                <h2 className="text-[#101322] dark:text-white text-lg font-black italic tracking-tighter uppercase flex-1 text-center pr-12 transition-colors duration-500">
                    Nouveau mot de passe
                </h2>
            </div>

            <div className="flex-1 px-6 pt-10 z-10 flex flex-col">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] ml-1">Nouveau mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className={`w-full h-16 bg-white dark:bg-[#161b2e] border ${errors.password ? 'border-red-500/50' : 'border-black/5 dark:border-white/10'} rounded-3xl px-6 text-[#101322] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-700 focus:outline-none focus:border-[#D4AF37]/50 transition-all font-medium italic shadow-inner`}
                            placeholder="Min. 8 caractères"
                            required
                        />
                        {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.password[0] || errors.password}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] ml-1">Confirmer</label>
                        <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={e => setPasswordConfirmation(e.target.value)}
                            className={`w-full h-16 bg-white dark:bg-[#161b2e] border ${errors.password_confirmation ? 'border-red-500/50' : 'border-black/5 dark:border-white/10'} rounded-3xl px-6 text-[#101322] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-700 focus:outline-none focus:border-[#D4AF37]/50 transition-all font-medium italic shadow-inner`}
                            placeholder="••••••••"
                            required
                        />
                        {errors.password_confirmation && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.password_confirmation[0] || errors.password_confirmation}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="flex items-center justify-center gap-4 rounded-3xl h-18 px-6 bg-[#D4AF37] text-[#101322] text-xs font-black uppercase tracking-[0.2em] w-full shadow-2xl shadow-[#D4AF37]/10 active:scale-[0.98] transition-all border border-white/10 mt-4"
                    >
                        {processing ? (
                            <div className="w-6 h-6 border-4 border-[#101322]/30 border-t-[#101322] rounded-full animate-spin"></div>
                        ) : (
                            <span>Réinitialiser</span>
                        )}
                    </button>
                </form>
            </div>

            {/* iOS Home Indicator Spacer */}
            <div className="h-8 w-full"></div>
        </div>
    );
}
