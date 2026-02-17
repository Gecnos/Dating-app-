import React from 'react';
import { Link, usePage } from '@inertiajs/react';

const NavigationBar = () => {
    const { url } = usePage();

    const navItems = [
        {
            name: 'Découverte',
            path: '/discovery',
            icon: 'swipe_vertical',
            filled: true
        },
        {
            name: 'Explorer',
            path: '/explorer',
            icon: 'explore',
            filled: true
        },
        {
            name: 'Likes',
            path: '/likes',
            icon: 'favorite',
            filled: false
        },
        {
            name: 'Chat',
            path: '/chat',
            icon: 'chat_bubble',
            filled: false
        },
        {
            name: 'Profil',
            path: '/my-profile',
            icon: 'person',
            filled: false
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#161b2e] px-4 pb-8 pt-3 flex items-center justify-between z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
            {navItems.map((item) => {
                const isActive = url.startsWith(item.path);
                return (
                    <Link
                        key={item.name}
                        href={item.path}
                        prefetch
                        onClick={(e) => {
                            if (url.startsWith(item.path)) {
                                e.preventDefault();
                            }
                        }}
                        className={`flex flex-1 flex-col items-center justify-end gap-1.5 transition-all ${isActive ? 'text-[#D4AF37]' : 'text-gray-500'
                            }`}
                    >
                        <div className="flex h-7 items-center justify-center">
                            <span
                                className="material-symbols-outlined text-[26px]"
                                style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
                            >
                                {item.icon}
                            </span>
                        </div>
                        <p className={`text-[9px] tracking-[0.1em] uppercase font-black italic`}>
                            {item.name}
                        </p>
                    </Link>
                );
            })}

            {/* iOS Home Indicator Spacer (Visual only) */}
            <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none">
                <div className="h-1 w-32 rounded-full bg-white opacity-5"></div>
            </div>
        </nav>
    );
};

export default NavigationBar;
