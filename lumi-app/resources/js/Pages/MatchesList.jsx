import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function MatchesList({ matches }) {
    return (
        <div className="min-h-screen bg-[#101322] flex flex-col font-sans mb-24 text-white">
            <Head title="Mes Messages" />

            {/* Header */}
            <div className="bg-[#161b2e] px-6 py-8 border-b border-white/10 flex items-center justify-between sticky top-0 z-20 shadow-xl">
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Messages</h1>
            </div>

            <div className="flex-1 p-6 space-y-2">
                {/* Matches Row (New matches without messages) */}
                <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2 mb-5">Nouveaux Matches</h2>
                    <div className="flex space-x-6 px-2">
                        {matches.length > 0 ? matches.map((match) => (
                            <Link key={match.id} href={`/chat/${match.id}`} className="flex flex-col items-center space-y-3 min-w-[80px] group">
                                <div className="relative">
                                    <div className="size-20 rounded-[1.8rem] bg-gradient-to-br from-[#D4AF37] to-[#E1AD01] p-[3px] shadow-2xl transition-transform group-active:scale-95">
                                        <img src={match.avatar || 'https://via.placeholder.com/100'} className="w-full h-full rounded-[1.6rem] object-cover border-4 border-[#101322]" alt={match.name} />
                                    </div>
                                    <div className="absolute bottom-1 right-1 size-5 bg-green-500 border-4 border-[#101322] rounded-full shadow-lg"></div>
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-tighter text-gray-300 italic">{match.name}</span>
                            </Link>
                        )) : (
                            <p className="text-[11px] text-gray-600 italic font-medium px-2">Lancez-vous et trouvez vos premiers matches !</p>
                        )}
                    </div>
                </div>

                {/* Conversations List */}
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2 mb-4">Conversations</h2>
                <div className="bg-[#161b2e] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
                    {matches.length > 0 ? matches.map((match, index) => (
                        <Link
                            key={match.id}
                            href={`/chat/${match.id}`}
                            className={`flex items-center space-x-5 p-6 hover:bg-[#1a1f35] transition-all group ${index !== matches.length - 1 ? 'border-b border-white/5' : ''}`}
                        >
                            <img src={match.avatar || 'https://via.placeholder.com/100'} className="size-16 rounded-2xl object-cover border border-white/10 shadow-lg group-hover:border-[#D4AF37]/50 transition-colors" alt={match.name} />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-black italic text-gray-100 italic tracking-tight">{match.name}</h3>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">10:45</span>
                                </div>
                                <p className="text-[11px] text-gray-400 font-medium truncate w-48">Dites bonjour à {match.name} ! 👋</p>
                            </div>
                            {match.intention && (
                                <div className="size-2.5 rounded-full bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/20"></div>
                            )}
                        </Link>
                    )) : (
                        <div className="p-16 text-center">
                            <div className="size-16 bg-[#101322]/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <span className="material-symbols-outlined text-gray-700 text-3xl">inbox</span>
                            </div>
                            <p className="text-xs text-gray-600 font-black uppercase tracking-widest">Aucune discussion</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
