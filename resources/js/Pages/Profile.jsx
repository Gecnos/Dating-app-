import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthProvider';
import { useCache } from '../contexts/CacheContext';

export default function Profile() {
    const { logout, user: authUser } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(authUser || {});
    const [loading, setLoading] = useState(true);

    const MISSING_FIELD_LABELS = {
        bio: 'Ajoute une bio',
        job: 'Indique ton métier',
        education: 'Indique ta formation',
        height: 'Ajoute ta taille',
        city: 'Ajoute ta ville',
        interests: 'Ajoute au moins 3 centres d\'intérêt',
        photos: 'Ajoute au moins 2 photos',
    };

    const menuItems = [
        { label: 'Modifier mon profil', icon: 'edit', route: '/profile/edit' },
        { label: 'Gérer mes photos', icon: 'photo_library', route: '/photos/manage' },
        { label: 'Paramètres', icon: 'settings', route: '/settings' },
        { label: 'Aide & Sécurité', icon: 'security', route: '/help' },
    ];

    const { getCachedData, setCachedData } = useCache();
    // Cache for 2 mins (Profile changes when user edits, but navigation back/forth should be instant)
    const CACHE_KEY = 'my_profile_dashboard';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const cached = getCachedData(CACHE_KEY);
        if (cached) {
            console.log("Serving Dashboard Profile from cache");
            setUser(cached);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Using /api/profile/edit to get full user details including photos
            const response = await axios.get('/profile/edit');
            const data = response.data.user || authUser;
            setUser(data);
            setCachedData(CACHE_KEY, data, 120);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Utiliser la première photo comme couverture, sinon l'avatar
    const coverImage = user.photos?.length > 0 ? user.photos[0].url : user.avatar;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#101322]">
                <div className="size-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] text-[#101322] dark:text-white font-['Be_Vietnam_Pro'] pb-32 overflow-x-hidden transition-colors duration-500">
            <main className="relative mx-auto max-w-md w-full bg-white dark:bg-[#161b2e] min-h-screen shadow-2xl overflow-hidden transition-colors duration-500">

                {/* Cover Image Section */}
                <div className="relative h-[45vh] w-full">
                    <div className="absolute inset-0 bg-gray-900">
                        <img
                            src={coverImage || 'https://via.placeholder.com/600x800'}
                            alt={user.name}
                            className="w-full h-full object-cover opacity-90"
                        />
                    </div>

                    {/* Gradient Overlays */}
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#161b2e] via-[#161b2e]/60 to-transparent" />
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent" />

                    {/* Settings Button (Top Right) */}
                    <Link to="/settings" className="absolute top-6 right-6 p-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white shadow-lg active:scale-95 transition-all hover:bg-white/20">
                        <span className="material-symbols-outlined text-2xl">settings</span>
                    </Link>

                    {/* User Info Overlay (Bottom Left) */}
                    <div className="absolute bottom-4 left-6 right-6 z-20">
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3 mb-1 shadow-black/50 drop-shadow-lg">
                            {user.name} <span className="text-2xl opacity-90 font-bold">{user.age || 24}</span>
                            {user.is_verified && (
                                <span className="material-symbols-outlined text-[#D4AF37] text-3xl drop-shadow-md bg-white rounded-full" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            )}
                        </h1>
                        <p className="text-white/80 font-bold text-sm flex items-center gap-1 shadow-black/50 drop-shadow-md mb-4">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {user.city || 'Cotonou'}
                        </p>
                    </div>
                </div>

                {/* Content Body */}
                <div className="px-6 relative z-10 bg-white dark:bg-[#161b2e] rounded-t-[2rem] -mt-6 pt-8 transition-colors duration-500">

                    {/* Profile Completion */}
                    {user.profile_completion && user.profile_completion.percentage < 100 && (
                        <div className="mb-8 p-6 rounded-[2rem] bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#101322] dark:text-white">Profil complet à</h3>
                                <span className="text-lg font-black italic text-[#D4AF37]">{user.profile_completion.percentage}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden mb-4">
                                <div
                                    className="h-full bg-[#D4AF37] rounded-full transition-all duration-500"
                                    style={{ width: `${user.profile_completion.percentage}%` }}
                                />
                            </div>
                            {user.profile_completion.missing.length > 0 && (
                                <Link to="/profile/edit" className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#D4AF37] transition-colors">
                                    <span>{MISSING_FIELD_LABELS[user.profile_completion.missing[0]] || 'Complète ton profil'}</span>
                                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Menu List */}
                    <div className="space-y-4 mb-8">
                        {menuItems.map((item, idx) => (
                            <Link
                                key={idx}
                                to={item.route}
                                className="flex items-center justify-between p-2 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-[#D4AF37] group-hover:text-[#101322] transition-colors duration-300">
                                        <span className="material-symbols-outlined">{item.icon}</span>
                                    </div>
                                    <span className="font-bold text-[#101322] dark:text-white text-sm tracking-wide">{item.label}</span>
                                </div>
                                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-[#D4AF37] transition-colors">chevron_right</span>
                            </Link>
                        ))}
                    </div>

                    {/* Logout */}
                    <div className="text-center pb-8">
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 text-red-500/80 hover:text-red-500 font-bold uppercase text-[10px] tracking-widest transition-colors px-6 py-3 rounded-full hover:bg-red-500/10"
                        >
                            <span className="material-symbols-outlined text-base">logout</span>
                            Se déconnecter
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}
