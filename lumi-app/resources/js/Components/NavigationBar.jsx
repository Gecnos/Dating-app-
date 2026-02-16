import React from 'react';
import { Link, usePage } from '@inertiajs/react';

const NavigationBar = () => {
    const { url } = usePage();

    const navItems = [
        {
            name: 'Cards',
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
            name: 'Messages',
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
        <nav className="fixed bottom-0 left-0 right-0 gap-2 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-[#101322]/95 backdrop-blur-md px-4 pb-8 pt-3 flex items-center justify-between z-50">
            {navItems.map((item) => {
                const isActive = url.startsWith(item.path);
                return (
                    <Link
                        key={item.name}
                        href={item.path}
                        className={`flex flex-1 flex-col items-center justify-end gap-1 transition-all ${isActive ? 'text-[#D4AF37]' : 'text-gray-400 dark:text-gray-500'
                            }`}
                    >
                        <div className="flex h-7 items-center justify-center">
                            <span
                                className="material-symbols-outlined"
                                style={{ fontVariationSettings: `'FILL' ${isActive || item.filled && isActive ? 1 : 0}` }}
                            >
                                {item.icon}
                            </span>
                        </div>
                        <p className={`text-[10px] tracking-wide uppercase ${isActive ? 'font-bold' : 'font-medium'}`}>
                            {item.name}
                        </p>
                    </Link>
                );
            })}

            {/* iOS Home Indicator Spacer (Visual only) */}
            <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none">
                <div className="h-1 w-32 rounded-full bg-gray-300 dark:bg-gray-700 opacity-20"></div>
            </div>
        </nav>
    );
};

export default NavigationBar;
