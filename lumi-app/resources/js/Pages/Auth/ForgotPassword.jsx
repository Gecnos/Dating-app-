import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';

export default function ForgotPassword() {
    const { error: toastError } = useToast();

    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await axios.post('/password/forgot', { email });
            setSent(true);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                toastError(err.response?.data?.message || 'Une erreur est survenue.');
            }
        } finally {
            setProcessing(false);
        }
    };

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
                    Mot de passe oublié
                </h2>
            </div>

            <div className="flex-1 px-6 pt-10 z-10 flex flex-col">
                {sent ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 px-6">
                        <span className="material-symbols-outlined text-[#D4AF37] text-6xl">mark_email_read</span>
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">Vérifiez vos emails</h3>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                                Si un compte existe avec l'adresse <strong>{email}</strong>, un lien de réinitialisation vient d'être envoyé.
                            </p>
                        </div>
                        <Link to="/login" className="text-[#D4AF37] text-xs font-black uppercase tracking-widest hover:underline">
                            Retour à la connexion
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Entrez votre email, nous vous enverrons un lien pour réinitialiser votre mot de passe.
                        </p>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className={`w-full h-16 bg-white dark:bg-[#161b2e] border ${errors.email ? 'border-red-500/50' : 'border-black/5 dark:border-white/10'} rounded-3xl px-6 text-[#101322] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-700 focus:outline-none focus:border-[#D4AF37]/50 transition-all font-medium italic shadow-inner`}
                                placeholder="votre@email.com"
                                required
                            />
                            {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.email[0] || errors.email}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center justify-center gap-4 rounded-3xl h-18 px-6 bg-[#D4AF37] text-[#101322] text-xs font-black uppercase tracking-[0.2em] w-full shadow-2xl shadow-[#D4AF37]/10 active:scale-[0.98] transition-all border border-white/10 mt-4"
                        >
                            {processing ? (
                                <div className="w-6 h-6 border-4 border-[#101322]/30 border-t-[#101322] rounded-full animate-spin"></div>
                            ) : (
                                <span>Envoyer le lien</span>
                            )}
                        </button>
                    </form>
                )}
            </div>

            {/* iOS Home Indicator Spacer */}
            <div className="h-8 w-full"></div>
        </div>
    );
}
