import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Verify({ users }) {
    const { post } = useForm();

    const handleAction = (id, action) => {
        post(route('admin.verify.action', { id, action }));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <Head title="Modération - Vérification" />

            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Vérification Selfie</h1>
                        <p className="text-gray-500">Comparez la photo de profil avec le selfie de vérification.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {users.map((user) => (
                        <div key={user.id} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-200 flex flex-col">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <span className="font-bold text-gray-800">{user.name}, {user.id}</span>
                                <span className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-black uppercase">En attente</span>
                            </div>

                            {/* Split Screen Comparison */}
                            <div className="grid grid-cols-2 gap-px bg-gray-200 h-80">
                                <div className="relative group">
                                    <img src={user.avatar || 'https://via.placeholder.com/400'} className="w-full h-full object-cover" alt="Profile" />
                                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[8px] text-white font-black uppercase">Profil</div>
                                </div>
                                <div className="relative group">
                                    <img src={user.verification_selfie || 'https://via.placeholder.com/400'} className="w-full h-full object-cover" alt="Selfie" />
                                    <div className="absolute top-2 left-2 bg-blue-600 px-2 py-0.5 rounded text-[8px] text-white font-black uppercase">Selfie</div>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <p className="text-xs text-gray-500 mb-6 italic">Inscrit le {new Date(user.created_at).toLocaleDateString()}</p>

                                <div className="mt-auto grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleAction(user.id, 'reject')}
                                        className="py-3 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-colors"
                                    >
                                        Rejeter
                                    </button>
                                    <button
                                        onClick={() => handleAction(user.id, 'approve')}
                                        className="py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-200"
                                    >
                                        Approuver
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {users.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Tout est à jour !</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">Il n'y a aucun selfie en attente de vérification pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
