import React, { useState } from 'react';
import axios from '../api/axios';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

export default function AdminBroadcast() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [url, setUrl] = useState('');
    const [sending, setSending] = useState(false);
    const { success, error } = useToast();
    const { confirm } = useConfirm();

    const handleSend = () => {
        if (!title.trim() || !content.trim()) return;

        confirm({
            title: "Diffuser à tous les utilisateurs",
            message: "Cette notification sera envoyée à absolument tous les comptes. Confirmer l'envoi ?",
            isDangerous: true,
            confirmText: "Envoyer",
            onConfirm: async () => {
                setSending(true);
                try {
                    const response = await axios.post('/admin/broadcast', {
                        title: title.trim(),
                        content: content.trim(),
                        url: url.trim() || undefined,
                    });
                    success(`Notification envoyée à ${response.data.notified_count} utilisateur(s).`);
                    setTitle('');
                    setContent('');
                    setUrl('');
                } catch (err) {
                    console.error("Broadcast failed", err);
                    error("Une erreur est survenue.");
                } finally {
                    setSending(false);
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Diffuser une notification</h1>
                    <p className="text-gray-500">Envoie une notification in-app à tous les utilisateurs (alerte sécurité, annonce...).</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">Titre</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                            placeholder="Ex : Maintenance prévue ce soir"
                            className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-4 text-gray-900 focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">Message</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            maxLength={500}
                            rows={4}
                            placeholder="Le contenu de la notification..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:outline-none focus:border-blue-500 transition-all resize-none"
                        />
                        <p className="text-[10px] text-gray-400 text-right">{content.length}/500</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">Lien (optionnel)</label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="/discovery"
                            className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-4 text-gray-900 focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={sending || !title.trim() || !content.trim()}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {sending ? 'Envoi en cours...' : 'Envoyer à tous les utilisateurs'}
                    </button>
                </div>
            </div>
        </div>
    );
}
