import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useToast } from '../contexts/ToastContext';

const ACTION_LABELS = {
    'verify.approve': 'Vérification approuvée',
    'verify.reject': 'Vérification refusée',
    'report.resolve': 'Signalement traité',
    'user.ban': 'Compte suspendu',
    'user.unban': 'Compte réactivé',
    'photo.delete': 'Photo supprimée',
    'broadcast.send': 'Message diffusé',
};

export default function AdminActivityLog() {
    const [logs, setLogs] = useState([]);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const { error } = useToast();

    useEffect(() => {
        const controller = new AbortController();
        fetchLogs('/admin/activity-log', controller.signal, false);
        return () => controller.abort();
    }, []);

    const fetchLogs = async (url, signal, append) => {
        append ? setLoadingMore(true) : setLoading(true);
        try {
            const response = await axios.get(url, { signal });
            setLogs(prev => append ? [...prev, ...response.data.data] : response.data.data);
            setNextPageUrl(response.data.next_page_url);
        } catch (err) {
            if (!axios.isCancel(err)) {
                console.error("Failed to fetch admin activity log", err);
                error("Impossible de charger le journal d'activité.");
            }
        } finally {
            append ? setLoadingMore(false) : setLoading(false);
        }
    };

    const loadMore = () => {
        if (!nextPageUrl) return;
        // next_page_url is absolute (includes host); axios instance already
        // prefixes /api, so strip that back off to reuse the same instance.
        const relative = nextPageUrl.replace(/^https?:\/\/[^/]+\/api/, '');
        fetchLogs(relative, undefined, true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="size-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Journal d'activité</h1>
                        <p className="text-gray-500">Actions effectuées par les administrateurs.</p>
                    </div>
                    <Link
                        to="/admin/dashboard"
                        className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline"
                    >
                        Tableau de bord →
                    </Link>
                </div>

                {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                        <p className="text-gray-500">Aucune action enregistrée pour le moment.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log) => (
                            <div key={log.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-bold text-gray-900">
                                        {ACTION_LABELS[log.action] || log.action}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Par {log.admin?.name || 'Admin supprimé'}
                                        {log.target_type && log.target_id ? ` · ${log.target_type} #${log.target_id}` : ''}
                                    </p>
                                    {log.details && (
                                        <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap break-all">
                                            {JSON.stringify(log.details)}
                                        </pre>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400 shrink-0">
                                    {new Date(log.created_at).toLocaleString()}
                                </span>
                            </div>
                        ))}

                        {nextPageUrl && (
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline disabled:opacity-50"
                                >
                                    {loadingMore ? 'Chargement...' : 'Charger plus'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
