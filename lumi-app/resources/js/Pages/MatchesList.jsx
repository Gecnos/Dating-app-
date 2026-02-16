import React from 'react';
import { Head, Link } from '@inertiajs/react';
import NavigationBar from '@/Components/NavigationBar';

export default function MatchesList({ matches }) {
    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans mb-24">
            <Head title="Mes Messages" />

            {/* Header */}
            <div className="bg-white px-6 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
                <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Messages</h1>
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                </div>
            </div>

            <div className="flex-1 p-4 space-y-2">
                {/* Matches Row (New matches without messages) */}
                <div className="mb-6 overflow-x-auto pb-2">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-4">Nouveaux Matches</h2>
                    <div className="flex space-x-6 px-2">
                        {matches.length > 0 ? matches.map((match) => (
                            <Link key={match.id} href={`/chat/${match.id}`} className="flex flex-col items-center space-y-2 min-w-[70px]">
                                <div className="relative">
                                    <img src={match.avatar || 'https://via.placeholder.com/100'} className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37] p-0.5" alt={match.name} />
                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <span className="text-[11px] font-bold text-gray-700">{match.name}</span>
                            </Link>
                        )) : (
                            <p className="text-xs text-gray-500 italic">Trouvez des matches dans le deck de découverte !</p>
                        )}
                    </div>
                </div>

                {/* Conversations List */}
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Conversations</h2>
                <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
                    {matches.length > 0 ? matches.map((match, index) => (
                        <Link
                            key={match.id}
                            href={`/chat/${match.id}`}
                            className={`flex items-center space-x-4 p-5 hover:bg-gray-50 transition-colors ${index !== matches.length - 1 ? 'border-bottom border-gray-50' : ''}`}
                        >
                            <img src={match.avatar || 'https://via.placeholder.com/100'} className="w-14 h-14 rounded-full object-cover" alt={match.name} />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-gray-900">{match.name}</h3>
                                    <span className="text-[10px] text-gray-400">10:45</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate w-48">Dites bonjour à {match.name} ! 👋</p>
                            </div>
                            {match.intention && (
                                <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                            )}
                        </Link>
                    )) : (
                        <div className="p-10 text-center">
                            <p className="text-sm text-gray-500">Pas encore de conversation.</p>
                        </div>
                    )}
                </div>
            </div>

            <NavigationBar />
        </div>
    );
}
