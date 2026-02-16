import React, { useState } from 'react';
import { Head, usePage, useForm, Link } from '@inertiajs/react';

export default function Login() {
    const { flash } = usePage().props;
    const [showEmailForm, setShowEmailForm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen bg-[#101322] font-['Be_Vietnam_Pro'] antialiased overflow-x-hidden text-white flex flex-col relative">
            <Head>
                <title>Lumi - Connexion Premium</title>
            </Head>

            {/* Benin Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(#E1AD01 0.5px, transparent 0.5px)',
                    backgroundSize: '24px 24px'
                }}>
            </div>

            {/* Flash Messages */}
            {(flash?.error || errors.email) && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-sm z-50 px-6">
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl text-center text-xs backdrop-blur-md">
                        {flash?.error || errors.email}
                    </div>
                </div>
            )}

            {/* Top Navigation Bar */}
            <div className="flex items-center bg-transparent p-4 justify-between z-10">
                <button
                    onClick={() => showEmailForm ? setShowEmailForm(false) : window.history.back()}
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 shadow-sm backdrop-blur-sm hover:bg-white/20 transition-all"
                >
                    <span className="material-symbols-outlined text-white">
                        {showEmailForm ? 'arrow_back' : 'close'}
                    </span>
                </button>
                <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
                    {showEmailForm ? 'Par Email' : 'Connexion'}
                </h2>
            </div>

            {/* Hero Section */}
            {!showEmailForm && (
                <div className="flex w-full flex-col px-6 pt-8 z-10">
                    <div className="w-full aspect-[4/3] rounded-[2rem] overflow-hidden mb-8 relative border border-white/5 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2cbd]/20 to-[#0f2cbd]/40 flex items-center justify-center">
                            <div className="w-48 h-48 bg-white/10 rounded-full blur-3xl absolute -top-10 -left-10 animate-pulse"></div>
                            <div className="w-32 h-32 bg-[#0f2cbd]/30 rounded-full blur-2xl absolute -bottom-5 -right-5"></div>

                            {/* Visual representation of "Premium Benin" */}
                            <div className="flex flex-col items-center gap-4 z-10">
                                <div className="relative">
                                    <span className="material-symbols-outlined text-[#E1AD01] text-7xl opacity-90 drop-shadow-[0_0_20px_rgba(225,173,1,0.5)]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        verified_user
                                    </span>
                                    <div className="absolute -inset-2 border-2 border-[#E1AD01]/20 rounded-full scale-110"></div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="h-2 w-8 rounded-full bg-[#0f2cbd]"></span>
                                    <span className="h-2 w-2 rounded-full bg-[#0f2cbd]/40"></span>
                                    <span className="h-2 w-2 rounded-full bg-[#0f2cbd]/40"></span>
                                </div>
                            </div>
                        </div>
                        {/* Geometric Pattern Overlay */}
                        <div className="absolute inset-0 bg-center bg-no-repeat bg-cover mix-blend-overlay opacity-10 pointer-events-none"
                            style={{
                                backgroundImage: `
                                    linear-gradient(30deg, #0f2cbd 12%, transparent 12.5%, transparent 87%, #0f2cbd 87.5%, #0f2cbd),
                                    linear-gradient(150deg, #0f2cbd 12%, transparent 12.5%, transparent 87%, #0f2cbd 87.5%, #0f2cbd)
                                `,
                                backgroundSize: '40px 70px'
                            }}>
                        </div>
                    </div>

                    <div className="text-center space-y-3">
                        <h1 className="text-white tracking-tight text-3xl md:text-4xl font-black leading-tight">
                            Rencontrez autrement au Bénin
                        </h1>
                        <p className="text-white/60 text-sm md:text-base font-medium leading-relaxed max-w-xs mx-auto">
                            La plateforme premium de rencontres sécurisées et orientées vers l'avenir.
                        </p>
                    </div>
                </div>
            )}

            {/* Email Form Section */}
            {showEmailForm && (
                <div className="flex-1 px-6 pt-8 z-10 flex flex-col">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#E1AD01] uppercase tracking-widest ml-1">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#E1AD01]/50 transition-all font-medium"
                                placeholder="votre@email.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#E1AD01] uppercase tracking-widest ml-1">Mot de passe</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#E1AD01]/50 transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center justify-center gap-3 rounded-full h-15 px-5 bg-[#0f2cbd] text-white text-base font-bold w-full shadow-xl shadow-[#0f2cbd]/20 active:scale-[0.98] transition-all border border-white/5 mt-8"
                        >
                            {processing ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-xl">login</span>
                                    <span>Se connecter</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-white/40 text-sm">
                            Pas encore de compte ?{' '}
                            <Link href="/register" className="text-[#E1AD01] font-bold hover:underline">
                                Créer un compte
                            </Link>
                        </p>
                    </div>
                </div>
            )}

            {/* Button Group Section (Main Menu) */}
            {!showEmailForm && (
                <div className="mt-auto pb-10 px-6 space-y-4 z-10">
                    <a
                        href="/auth/google"
                        className="flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full h-15 px-5 bg-white text-[#111218] text-base font-bold tracking-[0.015em] w-full shadow-lg hover:bg-gray-50 active:scale-[0.98] transition-all"
                    >
                        <img alt="Google" className="w-5 h-5" src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" />
                        <span className="truncate">Continuer avec Google</span>
                    </a>

                    <button
                        onClick={() => setShowEmailForm(true)}
                        className="flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full h-15 px-5 bg-[#0f2cbd] text-white text-base font-bold tracking-[0.015em] w-full shadow-xl shadow-[#0f2cbd]/20 active:scale-[0.98] transition-all border border-white/5"
                    >
                        <span className="material-symbols-outlined text-xl">mail</span>
                        <span className="truncate">Continuer avec Email</span>
                    </button>

                    <div className="flex items-center justify-center gap-2 mt-4 text-[#E1AD01] font-bold text-xs uppercase tracking-widest opacity-80">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        <span>Vérifié & Sécurisé</span>
                    </div>

                    <div className="px-4 mt-6">
                        <p className="text-white/40 text-[10px] font-medium leading-relaxed text-center uppercase tracking-wider">
                            En continuant, vous acceptez nos
                            <span className="underline ml-1">Conditions d'utilisation</span>
                            et notre
                            <span className="underline ml-1">Politique de confidentialité</span>.
                        </p>
                    </div>
                </div>
            )}

            {/* iOS Home Indicator Spacer */}
            <div className="h-8 w-full"></div>
        </div>
    );
}
