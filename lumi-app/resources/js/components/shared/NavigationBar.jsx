import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';

const NavigationBar = () => {
    const location = useLocation();
    const { user } = useAuth();

    // TODO: Get real counts from Context/WebSocket
    const unreadMessagesCount = user?.unread_messages_count || 0;
    const unreadNotificationsCount = user?.unread_notifications_count || 0;

    const navItems = [
        {
            name: 'Découverte',
            path: '/discovery',
            icon: 'swipe_vertical',
            filled: true
        },
        {
            name: 'Explorer',
            path: '/explorer', // This matches the route added
            icon: 'explore',
            filled: true
        },
        {
            name: 'Likes',
            path: '/likes',
            icon: 'favorite',
            filled: false,
            badge: unreadNotificationsCount // Note: Likes page usually shows likes, not notifications. But maybe design choice.
        },
        {
            name: 'Chat',
            path: '/chat',
            icon: 'chat_bubble',
            filled: false,
            badge: unreadMessagesCount
        },
        {
            name: 'Profil',
            path: '/profile',
            icon: 'person',
            filled: false
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#161b2e] px-4 pb-8 pt-3 flex items-center justify-between z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
            {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex flex-1 flex-col items-center justify-end gap-1.5 transition-all relative ${isActive ? 'text-[#D4AF37]' : 'text-gray-500'}`}
                    >
                        <div className="flex h-7 items-center justify-center relative">
                            <span
                                className="material-symbols-outlined text-[26px]"
                                style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
                            >
                                {item.icon}
                            </span>
                            {item.badge > 0 && (
                                <div className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-[#161b2e]">
                                    {item.badge > 99 ? '99+' : item.badge}
                                </div>
                            )}
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
