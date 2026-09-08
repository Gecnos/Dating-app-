import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

export default function AdminReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const { success, error } = useToast();
    const { confirm } = useConfirm();

    useEffect(() => {
        const controller = new AbortController();
        fetchReports(controller.signal);
        return () => controller.abort();
    }, []);

    const fetchReports = async (signal) => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/reports', { signal });
            setReports(response.data.reports || []);
        } catch (err) {
            if (!axios.isCancel(err)) {
                console.error("Failed to fetch reports", err);
                error("Impossible de charger les signalements.");
            }
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            await axios.post(`/admin/reports/${id}/resolve`);
            setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'reviewed' } : r));
            success("Signalement marqué comme traité.");
        } catch (err) {
            console.error("Resolve failed", err);
            error("Une erreur est survenue.");
        }
    };

    const handleBan = (report) => {
        confirm({
            title: "Suspendre ce compte",
            message: `Voulez-vous vraiment suspendre ${report.reported?.name} ? Toutes ses sessions actives seront coupées immédiatement.`,
            isDangerous: true,
            confirmText: "Suspendre",
            onConfirm: async () => {
                try {
                    await axios.post(`/admin/users/${report.reported_id}/ban`);
                    success("Compte suspendu.");
                    setReports(prev => prev.map(r =>
                        r.reported_id === report.reported_id
                            ? { ...r, reported: { ...r.reported, is_banned: true } }
                            : r
                    ));
                } catch (err) {
                    console.error("Ban failed", err);
                    error("Une erreur est survenue.");
                }
            }
        });
    };

    const handleDeletePhoto = (report, photoId) => {
        confirm({
            title: "Supprimer cette photo",
            message: "Cette action est irréversible.",
            isDangerous: true,
            confirmText: "Supprimer",
            onConfirm: async () => {
                try {
                    await axios.delete(`/admin/users/${report.reported_id}/photos/${photoId}`);
                    success("Photo supprimée.");
                    setReports(prev => prev.map(r =>
                        r.reported_id === report.reported_id
                            ? { ...r, reported: { ...r.reported, photos: r.reported.photos.filter(p => p.id !== photoId) } }
                            : r
                    ));
                } catch (err) {
                    console.error("Delete photo failed", err);
                    error("Une erreur est survenue.");
                }
            }
        });
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
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Signalements</h1>
                    <p className="text-gray-500">Les signalements urgents apparaissent en premier.</p>
                </div>

                <div className="space-y-4">
                    {reports.map((report) => {
                        const isUrgent = report.priority === 'urgent';
                        const isExpanded = expandedId === report.id;
                        const isResolved = report.status === 'reviewed';

                        return (
                            <div
                                key={report.id}
                                className={`bg-white rounded-3xl shadow-xl border-2 overflow-hidden ${isUrgent ? 'border-red-400' : 'border-gray-200'}`}
                            >
                                <div
                                    className="p-6 flex items-center justify-between cursor-pointer"
                                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        {isUrgent && (
                                            <span className="text-[10px] bg-red-100 text-red-600 px-3 py-1 rounded-full font-black uppercase animate-pulse">Urgent</span>
                                        )}
                                        {isResolved && (
                                            <span className="text-[10px] bg-green-100 text-green-600 px-3 py-1 rounded-full font-black uppercase">Traité</span>
                                        )}
                                        <div>
                                            <p className="font-bold text-gray-800">
                                                {report.reporter?.name} → {report.reported?.name}
                                            </p>
                                            <p className="text-sm text-gray-500">{report.reason}</p>
                                        </div>
                                    </div>
                                    <span className="text-gray-400 text-sm">{new Date(report.created_at).toLocaleDateString()}</span>
                                </div>

                                {isExpanded && (
                                    <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">
                                        {report.description && (
                                            <p className="text-sm text-gray-600 italic">"{report.description}"</p>
                                        )}

                                        {report.reported?.photos?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-black uppercase text-gray-400 mb-2">Photos du profil signalé</p>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {report.reported.photos.map((photo) => (
                                                        <div key={photo.id} className="relative group aspect-square">
                                                            <img src={photo.url} className="w-full h-full object-cover rounded-xl" alt="Photo profil" />
                                                            <button
                                                                onClick={() => handleDeletePhoto(report, photo.id)}
                                                                className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black uppercase"
                                                            >
                                                                Supprimer
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => handleBan(report)}
                                                disabled={report.reported?.is_banned}
                                                className="py-3 px-6 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                {report.reported?.is_banned ? 'Compte déjà suspendu' : 'Bannir'}
                                            </button>
                                            <button
                                                onClick={() => handleResolve(report.id)}
                                                disabled={isResolved}
                                                className="py-3 px-6 bg-gray-100 text-gray-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Résoudre
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {reports.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Aucun signalement</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">Tout est calme pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
