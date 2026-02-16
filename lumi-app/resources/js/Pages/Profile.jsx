import { Head, Link, router } from '@inertiajs/react';
import NavigationBar from '@/Components/NavigationBar';

export default function Profile({ user }) {
    return (
        <div className="min-h-screen bg-[#101322] text-white font-sans pb-32">
            <Head title="Mon Profil" />

            {/* Header Section */}
            <div className="pt-12 pb-8 px-6 flex flex-col items-center bg-[#12151c] rounded-b-[3rem] shadow-sm">
                <div className="relative">
                    <div
                        className="h-32 w-32 rounded-full bg-cover bg-center border-4 border-white/10 shadow-xl"
                        style={{ backgroundImage: `url(${user.avatar || 'https://via.placeholder.com/150'})` }}
                    />
                    {user.is_verified && (
                        <div className="absolute bottom-1 right-1 bg-[#12151c] rounded-full p-1 shadow-md">
                            <span className="material-symbols-outlined text-[#D4AF37] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </div>
                    )}
                </div>
                <div className="mt-4 flex items-center gap-2">
                    <h1 className="text-2xl font-black">{user.name}</h1>
                    {user.is_verified && (
                        <span className="text-sm font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            ✅ Vérifié
                        </span>
                    )}
                </div>
                <Link
                    href={route('profile.edit')}
                    className="mt-4 px-6 py-2 border border-white/20 rounded-full text-sm font-bold text-gray-300 hover:bg-white/5 transition-colors"
                >
                    Modifier le profil
                </Link>
            </div>

            {/* Wallet Section */}
            <div className="px-6 -mt-6">
                <div className="bg-gradient-to-br from-[#E1AD01] to-[#D4AF37] rounded-2xl p-6 shadow-lg shadow-[#D4AF37]/20 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-white/80 text-sm font-medium">Mon Portefeuille</p>
                            <h2 className="text-3xl font-extrabold mt-1">{user.credits || 0} Crédits</h2>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                        </div>
                    </div>
                    <Link
                        href={route('credits')}
                        className="mt-6 w-full py-3 bg-white text-[#D4AF37] font-bold rounded-xl shadow-sm active:scale-95 transition-transform flex items-center justify-center"
                    >
                        Recharger
                    </Link>
                </div>
            </div>

            {/* Settings Menu */}
            <div className="mt-8 px-6 flex flex-col gap-2">
                <button className="flex items-center justify-between p-4 bg-[#12151c] rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-300">manage_search</span>
                        </div>
                        <span className="font-bold text-gray-100">Paramètres de recherche</span>
                    </div>
                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </button>

                <div className="flex items-center justify-between p-4 bg-[#12151c] rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-900/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-400">visibility_off</span>
                        </div>
                        <div>
                            <span className="font-bold text-gray-100 block">Mode Fantôme</span>
                            <span className="text-[11px] text-gray-400">Naviguer incognito</span>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            className="sr-only peer"
                            type="checkbox"
                            checked={user.blur_enabled}
                            onChange={(e) => {
                                router.post(route('profile.update'), { blur_enabled: e.target.checked }, { preserveState: true });
                            }}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f2cbd]"></div>
                    </label>
                </div>

                <button className="flex items-center justify-between p-4 bg-[#12151c] rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-400">help_outline</span>
                        </div>
                        <span className="font-bold text-gray-100">Aide & Support</span>
                    </div>
                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </button>

                <button
                    onClick={() => router.post(route('logout'))}
                    className="mt-4 flex items-center justify-between p-4 bg-red-900/10 rounded-xl border border-red-900/20 w-full"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-600">logout</span>
                        </div>
                        <span className="font-bold text-red-600">Déconnexion</span>
                    </div>
                </button>
            </div>

            <NavigationBar />
        </div>
    );
}
