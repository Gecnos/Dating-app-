import { Head, Link, router } from '@inertiajs/react';

export default function Profile({ user }) {
    return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#101322] text-[#111218] dark:text-white font-sans pb-32 overflow-x-hidden">
            <Head title={`Profil - ${user.name}`} />

            <main className="max-w-lg mx-auto">
                <div className="bg-white dark:bg-[#161b2e] min-h-screen shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-[#161b2e]/80 backdrop-blur-xl z-20">
                        <div className="flex items-center gap-1 font-bold text-lg">
                            {user.name}
                            {user.is_verified && (
                                <span className="material-symbols-outlined text-[#D4AF37] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            )}
                        </div>
                        <Link href={route('settings')} className="p-1">
                            <span className="material-symbols-outlined text-gray-700 dark:text-gray-200">settings</span>
                        </Link>
                    </div>

                    {/* Profile Info */}
                    <div className="px-4 py-6">
                        <div className="flex items-center gap-8 mb-4">
                            <div className="relative flex-shrink-0">
                                <div
                                    className="h-20 w-20 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-700 shadow-sm"
                                    style={{ backgroundImage: `url(${user.avatar || 'https://via.placeholder.com/150'})` }}
                                />
                            </div>
                            <div className="flex flex-1 justify-around text-center">
                                <div>
                                    <div className="font-bold text-lg leading-tight">{user.photos?.length || 0}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-tighter">Photos</div>
                                </div>
                                <div>
                                    <div className="font-bold text-lg leading-tight">{user.credits || 0}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-tighter">Crédits</div>
                                </div>
                                <div>
                                    <div className="font-bold text-lg leading-tight">{user.matches_count || 0}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-tighter">Matches</div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6 px-1">
                            <h2 className="font-bold text-lg">{user.name}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                {user.bio ? (user.bio.length > 60 ? `${user.bio.substring(0, 60)}...` : user.bio) : "Prêt pour une nouvelle aventure ! 🇧🇯"}
                            </p>
                        </div>

                        {/* Wallet Card (Integrated) */}
                        <div className="mb-6 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#D4AF37] p-2.5 rounded-xl text-white shadow-lg shadow-[#D4AF37]/20">
                                    <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black text-[#D4AF37] tracking-wider">Portefeuille</p>
                                    <p className="font-bold text-gray-800 dark:text-white">{user.credits || 0} Crédits</p>
                                </div>
                            </div>
                            <Link
                                href={route('credits')}
                                className="px-5 py-2 bg-[#D4AF37] text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-sm active:scale-95 transition-all"
                            >
                                Recharger
                            </Link>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Link
                                href={route('profile.edit')}
                                className="flex-1 bg-gray-100 dark:bg-white/5 py-3 rounded-xl text-xs font-bold text-center border border-transparent dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                            >
                                Modifier le profil
                            </Link>
                            <button className="flex-1 bg-gray-100 dark:bg-white/5 py-3 rounded-xl text-xs font-bold border border-transparent dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                                Partager le profil
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-t border-gray-100 dark:border-gray-800">
                        <button className="flex-1 py-3 border-t-2 border-black dark:border-white">
                            <span className="material-symbols-outlined text-xl">grid_view</span>
                        </button>
                        <button className="flex-1 py-3 text-gray-400 border-t-2 border-transparent">
                            <span className="material-symbols-outlined text-xl">person_pin</span>
                        </button>
                    </div>

                    {/* Photo Grid */}
                    <div className="grid grid-cols-3 gap-0.5 bg-gray-100 dark:bg-gray-900">
                        {user.photos?.map((photo, i) => (
                            <div key={i} className="aspect-square relative group">
                                <img className="w-full h-full object-cover" src={photo.url} alt={`Photo ${i}`} />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <button className="absolute top-1 right-1 bg-black/30 text-white rounded-full p-1 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                </button>
                            </div>
                        ))}
                        {/* Empty Slots */}
                        {Array.from({ length: Math.max(0, 6 - (user.photos?.length || 0)) }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square bg-white dark:bg-[#1a1f35] flex items-center justify-center border border-gray-50 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-[#1e253c]">
                                <Link href={route('profile.edit')} className="text-gray-300 dark:text-gray-600">
                                    <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Logout Link */}
                    <div className="px-4 py-12 text-center">
                        <button
                            onClick={() => router.post(route('logout'))}
                            className="text-red-500 font-black uppercase text-[10px] tracking-widest hover:opacity-70 transition-opacity"
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
