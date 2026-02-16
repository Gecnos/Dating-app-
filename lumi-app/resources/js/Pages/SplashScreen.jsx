import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';

export default function SplashScreen() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 2;
            });
        }, 30);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (progress === 100) {
            const timer = setTimeout(() => {
                router.visit('/login');
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [progress]);

    return (
        <div className="min-h-screen bg-[#0a0c1a] font-['Be_Vietnam_Pro'] antialiased overflow-hidden flex flex-col items-center justify-between relative px-8 pb-16">
            <Head>
                <title>Lumi - Premium Dating Benin</title>
                <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@100;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </Head>

            {/* Cultural Pattern Overlays */}
            <div className="absolute inset-0 pointer-events-none opacity-5"
                style={{
                    backgroundImage: 'radial-gradient(#E1AD01 0.5px, transparent 0.5px)',
                    backgroundSize: '24px 24px'
                }}>
            </div>
            <div className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: `
                        linear-gradient(30deg, #0f2cbd 12%, transparent 12.5%, transparent 87%, #0f2cbd 87.5%, #0f2cbd),
                        linear-gradient(150deg, #0f2cbd 12%, transparent 12.5%, transparent 87%, #0f2cbd 87.5%, #0f2cbd),
                        linear-gradient(30deg, #0f2cbd 12%, transparent 12.5%, transparent 87%, #0f2cbd 87.5%, #0f2cbd),
                        linear-gradient(150deg, #0f2cbd 12%, transparent 12.5%, transparent 87%, #0f2cbd 87.5%, #0f2cbd),
                        linear-gradient(60deg, #0f2cbd77 25%, transparent 25.5%, transparent 75%, #0f2cbd77 75%, #0f2cbd77),
                        linear-gradient(60deg, #0f2cbd77 25%, transparent 25.5%, transparent 75%, #0f2cbd77 75%, #0f2cbd77)
                    `,
                    backgroundSize: '40px 70px',
                    backgroundPosition: '0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px'
                }}>
            </div>

            {/* iOS Status Bar Spacer */}
            <div className="h-12 w-full"></div>

            {/* Top Decorative Element */}
            <div className="mt-12 flex flex-col items-center opacity-40">
                <span className="material-symbols-outlined text-[#D4AF37] text-sm">verified_user</span>
                <p className="text-[9px] uppercase tracking-[0.4em] text-[#D4AF37] mt-2 font-black italic">SÉCURISÉ & VÉRIFIÉ</p>
            </div>

            {/* Central Branding Section */}
            <div className="flex flex-col items-center justify-center flex-grow -mt-20 z-10">
                {/* Logo Container */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                    {/* Main Logo Icon */}
                    <div className="relative z-10 w-28 h-28 bg-[#D4AF37] rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/30 transition-transform duration-700">
                        <span className="material-symbols-outlined text-[#101322] text-6xl font-black">flare</span>
                    </div>
                </div>

                {/* App Name */}
                <div className="mt-10 text-center">
                    <h1 className="text-7xl font-black tracking-tighter text-white italic uppercase">Lumi</h1>
                    <div className="h-2 w-16 bg-[#D4AF37] mx-auto mt-4 rounded-full shadow-lg shadow-[#D4AF37]/50"></div>
                    <p className="text-[#D4AF37]/80 mt-6 text-[10px] font-black tracking-[0.3em] uppercase italic">L'excellence au Bénin</p>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="w-full max-w-xs space-y-10 z-10">
                {/* Goal-oriented matching hint */}
                <div className="flex items-center justify-center gap-3 opacity-50">
                    <span className="material-symbols-outlined text-[#D4AF37] text-sm">favorite</span>
                    <p className="text-white text-[10px] font-black uppercase tracking-widest italic">Connecter les cœurs au Bénin</p>
                </div>

                {/* Loading Indicator */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-center">
                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] italic">
                            {progress < 100 ? 'Préparation de votre univers...' : 'Prêt à briller'}
                        </p>
                    </div>
                    <div className="rounded-full bg-white/5 h-1.5 overflow-hidden border border-white/5">
                        <div
                            className="h-full rounded-full bg-[#D4AF37] transition-all duration-300 ease-linear shadow-lg shadow-[#D4AF37]/50"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Background Depth Overlay */}
            <div className="fixed inset-0 z-[-1] opacity-20 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-b from-[#0a0c1a]/90 to-[#0f2cbd]/40"></div>
            </div>
        </div>
    );
}
