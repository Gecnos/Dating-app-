import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Profile({ user }) {
    const menuItems = [
        { label: 'Modifier mon profil', icon: 'edit', route: 'profile.edit' },
        { label: 'Gérer mes photos', icon: 'photo_library', route: 'photos.manage' },
        { label: 'Paramètres', icon: 'settings', route: 'settings' },
        { label: 'Aide & Sécurité', icon: 'security', route: 'help' },
    ];

    // Utiliser la première photo comme couverture, sinon l'avatar
    const coverImage = user.photos?.length > 0 ? user.photos[0].url : user.avatar;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] text-[#101322] dark:text-white font-sans pb-32 overflow-x-hidden transition-colors duration-500">
            <Head title={`Profil - ${user.name}`} />

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
                    <Link href={route('settings')} className="absolute top-6 right-6 p-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white shadow-lg active:scale-95 transition-all hover:bg-white/20">
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

                    {/* Credits Card (New Design) */}
                    <div className="mb-8 p-6 rounded-[2rem] bg-[#E5B80B] text-white shadow-xl relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-white/80 text-xs font-medium mb-1">Mon Portefeuille</p>
                                <h2 className="text-3xl font-bold">{user.credits || 0} Crédits</h2>
                            </div>
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                            </div>
                        </div>

                        <Link
                            href={route('credits')}
                            className="block w-full py-3.5 bg-white text-[#E5B80B] font-bold text-center rounded-xl shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all text-sm"
                        >
                            Recharger
                        </Link>
                    </div>

                    {/* Premium Card */}
                    <div className="mb-8">
                        <Link href={route('credits')} className="block relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#101322] to-[#2c3e50] shadow-xl group active:scale-[0.98] transition-all">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />

                            <div className="relative p-6 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-[#D4AF37] text-xl">workspace_premium</span>
                                        <h3 className="text-lg font-black italic tracking-tighter text-white uppercase">Lumi Premium</h3>
                                    </div>
                                    <p className="text-white/60 text-xs font-semibold max-w-[160px] leading-tight opacity-80">Boostez votre visibilité et débloquez tout.</p>
                                </div>
                                <div className="size-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#101322] shadow-lg group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Menu List */}
                    <div className="space-y-4 mb-8">
                        {menuItems.map((item, idx) => (
                            <Link
                                key={idx}
                                href={route(item.route)}
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
                            onClick={() => router.post(route('logout'))}
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
