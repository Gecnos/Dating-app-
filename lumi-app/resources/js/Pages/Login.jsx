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
            <div className="flex items-center bg-transparent p-6 justify-between z-10">
                <button
                    onClick={() => showEmailForm ? setShowEmailForm(false) : window.history.back()}
                    className="flex items-center justify-center size-12 rounded-2xl bg-[#161b2e] border border-white/10 shadow-xl active:scale-90 transition-all"
                >
                    <span className="material-symbols-outlined text-gray-400">
                        {showEmailForm ? 'arrow_back' : 'close'}
                    </span>
                </button>
                <h2 className="text-white text-lg font-black italic tracking-tighter uppercase flex-1 text-center pr-12">
                    {showEmailForm ? 'Par Email' : 'Connexion'}
                </h2>
            </div>

            {/* Hero Section */}
            {!showEmailForm && (
                <div className="flex w-full flex-col px-6 pt-6 z-10">
                    <div className="w-full aspect-[4/3] rounded-[3rem] overflow-hidden mb-10 relative border border-white/10 shadow-2xl bg-[#161b2e]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2cbd]/20 to-[#101322] flex items-center justify-center">
                            {/* Visual representation of "Premium Benin" */}
                            <div className="flex flex-col items-center gap-6 z-10">
                                <div className="relative">
                                    <div className="size-32 bg-[#D4AF37]/10 rounded-full absolute inset-[-1rem] blur-2xl animate-pulse"></div>
                                    <span className="material-symbols-outlined text-[#D4AF37] text-8xl relative z-10 opacity-90" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        verified_user
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="h-2 w-10 rounded-full bg-[#D4AF37]"></span>
                                    <span className="h-2 w-2 rounded-full bg-[#D4AF37]/30"></span>
                                    <span className="h-2 w-2 rounded-full bg-[#D4AF37]/30"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-4">
                        <h1 className="text-white tracking-tighter text-4xl font-black leading-none italic uppercase">
                            Rencontrez <br /> autrement
                        </h1>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-xs mx-auto italic">
                            La première plateforme premium <br /> de rencontres au Bénin.
                        </p>
                    </div>
                </div>
            )}

            {/* Email Form Section */}
            {showEmailForm && (
                <div className="flex-1 px-6 pt-10 z-10 flex flex-col">
                    <form onSubmit={submit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] ml-1">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="w-full h-16 bg-[#161b2e] border border-white/10 rounded-3xl px-6 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#D4AF37]/50 transition-all font-medium italic shadow-inner"
                                placeholder="votre@email.com"
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] ml-1">Mot de passe</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="w-full h-16 bg-[#161b2e] border border-white/10 rounded-3xl px-6 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#D4AF37]/50 transition-all font-medium italic shadow-inner"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center justify-center gap-4 rounded-3xl h-18 px-6 bg-[#D4AF37] text-[#101322] text-xs font-black uppercase tracking-[0.2em] w-full shadow-2xl shadow-[#D4AF37]/10 active:scale-[0.98] transition-all border border-white/10 mt-12"
                        >
                            {processing ? (
                                <div className="w-6 h-6 border-4 border-[#101322]/30 border-t-[#101322] rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Se connecter</span>
                                    <span className="material-symbols-outlined font-black">login</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-gray-500 text-[11px] font-black uppercase tracking-widest leading-loose">
                            Pas encore de compte ? <br />
                            <Link href="/register" className="text-[#D4AF37] hover:underline decoration-2 underline-offset-4">
                                Rejoindre Lumi Premium
                            </Link>
                        </p>
                    </div>
                </div>
            )}

            {/* Button Group Section (Main Menu) */}
            {!showEmailForm && (
                <div className="mt-auto pb-12 px-6 space-y-5 z-10">
                    <a
                        href="/auth/google"
                        className="flex cursor-pointer items-center justify-center gap-4 overflow-hidden rounded-[2rem] h-18 px-8 bg-white text-[#101322] text-xs font-black uppercase tracking-[0.2em] w-full shadow-2xl active:scale-[0.98] transition-all"
                    >
                        <img alt="Google" className="w-5 h-5" src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" />
                        <span className="truncate">Continuer avec Google</span>
                    </a>

                    <button
                        onClick={() => setShowEmailForm(true)}
                        className="flex cursor-pointer items-center justify-center gap-4 overflow-hidden rounded-[2rem] h-18 px-8 bg-[#161b2e] text-white text-xs font-black uppercase tracking-[0.2em] w-full shadow-xl border border-white/10 active:scale-[0.98] transition-all"
                    >
                        <span className="material-symbols-outlined text-gray-400">mail</span>
                        <span className="truncate">Continuer avec Email</span>
                    </button>

                    <div className="flex items-center justify-center gap-2 mt-6 text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.2em] opacity-80 italic">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        <span>Vérifié & Sécurisé au Bénin</span>
                    </div>

                    <div className="px-8 mt-8">
                        <p className="text-gray-600 text-[9px] font-black leading-relaxed text-center uppercase tracking-widest">
                            En continuant, vous acceptez nos
                            <span className="underline ml-1 decoration-gray-700">Conditions d'utilisation</span>
                            et notre
                            <span className="underline ml-1 decoration-gray-700">Politique de confidentialité</span>.
                        </p>
                    </div>
                </div>
            )}

            {/* iOS Home Indicator Spacer */}
            <div className="h-8 w-full"></div>
        </div>
    );
}
