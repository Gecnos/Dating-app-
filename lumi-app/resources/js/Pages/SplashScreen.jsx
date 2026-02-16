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
            <div className="mt-8 flex flex-col items-center opacity-40">
                <span className="material-symbols-outlined text-[#E1AD01] text-sm">verified_user</span>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#E1AD01] mt-1 font-semibold">Secure & Verified</p>
            </div>

            {/* Central Branding Section */}
            <div className="flex flex-col items-center justify-center flex-grow -mt-20 z-10">
                {/* Logo Container */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Outer glow */}
                    <div className="absolute inset-0 bg-[#E1AD01]/20 rounded-full blur-2xl"></div>
                    {/* Main Logo Icon */}
                    <div className="relative z-10 w-24 h-24 bg-[#E1AD01] rounded-full flex items-center justify-center shadow-2xl shadow-[#E1AD01]/40 transition-transform hover:scale-105 duration-700">
                        <span className="material-symbols-outlined text-[#0a0c1a] text-5xl font-bold">flare</span>
                    </div>
                    {/* Secondary Gold Accent Ring */}
                    <div className="absolute inset-0 border-2 border-[#E1AD01]/30 rounded-full scale-125 animate-[pulse_4s_infinite]"></div>
                </div>

                {/* App Name */}
                <div className="mt-8 text-center">
                    <h1 className="text-6xl font-bold tracking-tighter text-white">Lumi</h1>
                    <div className="h-1.5 w-12 bg-[#E1AD01] mx-auto mt-2 rounded-full shadow-[0_0_10px_rgba(225,173,1,0.5)]"></div>
                    <p className="text-[#E1AD01]/80 mt-4 text-sm font-medium tracking-[0.2em] uppercase">Benin Premium Dating</p>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="w-full max-w-xs space-y-8 z-10">
                {/* Goal-oriented matching hint */}
                <div className="flex items-center justify-center gap-2 opacity-60">
                    <span className="material-symbols-outlined text-white text-xs">favorite</span>
                    <p className="text-white text-[11px] tracking-wide">Connecting hearts in Cotonou & beyond</p>
                </div>

                {/* Loading Indicator */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-center">
                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">
                            {progress < 100 ? 'Setting the stage...' : 'Ready to shine'}
                        </p>
                    </div>
                    <div className="rounded-full bg-white/5 h-1.5 overflow-hidden border border-white/5">
                        <div
                            className="h-full rounded-full bg-[#E1AD01] transition-all duration-300 ease-linear shadow-[0_0_15px_rgba(225,173,1,0.5)]"
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
