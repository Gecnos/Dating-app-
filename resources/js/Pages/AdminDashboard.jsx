import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useToast } from '../contexts/ToastContext';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { error } = useToast();

    useEffect(() => {
        const controller = new AbortController();
        fetchStats(controller.signal);
        return () => controller.abort();
    }, []);

    const fetchStats = async (signal) => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/stats', { signal });
            setStats(response.data.stats || null);
        } catch (err) {
            if (!axios.isCancel(err)) {
                console.error("Failed to fetch admin stats", err);
                error("Impossible de charger les statistiques.");
            }
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    };

    const cards = stats ? [
        { label: 'Utilisateurs', value: stats.total_users, icon: '👤' },
        { label: 'Utilisateurs vérifiés', value: stats.verified_users, icon: '✅' },
        { label: 'Vérifications en attente', value: stats.pending_verifications, icon: '⏳' },
        { label: 'Matchs mutuels', value: stats.total_matches, icon: '💛' },
        { label: 'Messages (24h)', value: stats.messages_last_24h, icon: '💬' },
        { label: 'Nouveaux (7j)', value: stats.new_users_this_week, icon: '📈' },
    ] : [];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="size-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Tableau de bord</h1>
                        <p className="text-gray-500">Vue d'ensemble de l'application.</p>
                    </div>
                    <Link
                        to="/admin/verify"
                        className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline"
                    >
                        Vérifications →
                    </Link>
                </div>

                {stats ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cards.map((card) => (
                            <div key={card.label} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
                                <div className="text-3xl mb-3">{card.icon}</div>
                                <p className="text-3xl font-black text-gray-900">{card.value}</p>
                                <p className="text-gray-500 text-sm mt-1">{card.label}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                        <p className="text-gray-500">Impossible de charger les statistiques pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
