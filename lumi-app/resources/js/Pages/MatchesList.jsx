import React from 'react';
import { Link } from 'react-router-dom';

export default function MatchesList({ matches }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] flex flex-col font-sans mb-24 text-[#101322] dark:text-white transition-colors duration-500">
            {/* <Head title="Mes Messages" /> replaced by generic title logic or ignored */}

            {/* Header */}
            <div className="bg-white dark:bg-[#161b2e] px-6 py-8 border-b border-black/5 dark:border-white/10 flex items-center justify-between sticky top-0 z-20 shadow-xl dark:shadow-2xl transition-colors duration-500">
                <h1 className="text-2xl font-black text-[#101322] dark:text-white tracking-tighter uppercase italic transition-colors duration-500">Messages</h1>
            </div>

            <div className="flex-1 p-6 space-y-2">
                {/* Matches Row (New matches without messages) */}
                <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-2 mb-5 transition-colors duration-500">Nouveaux Matches</h2>
                    <div className="flex space-x-6 px-2">
                        {matches.length > 0 ? matches.map((match) => (
                            <Link key={match.id} to={`/chat/${match.id}`} className="flex flex-col items-center space-y-3 min-w-[80px] group">
                                <div className="relative">
                                    <div className="size-20 rounded-[1.8rem] bg-gradient-to-br from-[#D4AF37] to-[#E1AD01] p-[3px] shadow-2xl transition-transform group-active:scale-95">
                                        <img src={match.avatar || 'https://via.placeholder.com/100'} className="w-full h-full rounded-[1.6rem] object-cover border-4 border-white dark:border-[#101322] transition-colors duration-500" alt={match.name} />
                                    </div>
                                    <div className="absolute bottom-1 right-1 size-5 bg-green-500 border-4 border-white dark:border-[#101322] rounded-full shadow-lg transition-colors duration-500"></div>
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-tighter text-gray-500 dark:text-gray-300 italic transition-colors duration-500">{match.name}</span>
                            </Link>
                        )) : (
                            <p className="text-[11px] text-gray-600 italic font-medium px-2">Lancez-vous et trouvez vos premiers matches !</p>
                        )}
                    </div>
                </div>

                {/* Conversations List */}
                <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-2 mb-4 transition-colors duration-500">Conversations</h2>
                <div className="bg-white dark:bg-[#161b2e] rounded-[2.5rem] overflow-hidden shadow-xl dark:shadow-2xl border border-black/5 dark:border-white/5 transition-colors duration-500">
                    {matches.length > 0 ? matches.map((match, index) => (
                        <Link
                            key={match.id}
                            to={`/chat/${match.id}`}
                            className={`flex items-center space-x-5 p-6 hover:bg-gray-50 dark:hover:bg-[#1a1f35] transition-all group ${index !== matches.length - 1 ? 'border-b border-black/5 dark:border-white/5' : ''}`}
                        >
                            <img src={match.avatar || 'https://via.placeholder.com/100'} className="size-16 rounded-2xl object-cover border border-black/5 dark:border-white/10 shadow-lg group-hover:border-[#D4AF37]/50 transition-colors" alt={match.name} />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-black italic text-[#101322] dark:text-gray-100 italic tracking-tight transition-colors duration-500">{match.name}</h3>
                                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors duration-500">10:45</span>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate w-48 transition-colors duration-500">Dites bonjour à {match.name} ! 👋</p>
                            </div>
                            {match.intention && (
                                <div className="size-2.5 rounded-full bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/20"></div>
                            )}
                        </Link>
                    )) : (
                        <div className="p-16 text-center">
                            <div className="size-16 bg-gray-50 dark:bg-[#101322]/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-black/5 dark:border-white/5 transition-colors duration-500">
                                <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 text-3xl transition-colors duration-500">inbox</span>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-600 font-black uppercase tracking-widest transition-colors duration-500">Aucune discussion</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
