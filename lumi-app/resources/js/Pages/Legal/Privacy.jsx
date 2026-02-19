import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Privacy() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Politique de Confidentialité - Lumi";
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] text-[#101322] dark:text-white font-['Be_Vietnam_Pro'] pb-10 transition-colors duration-500">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#101322]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/10 transition-all duration-500">
                <Link to="/settings" className="w-10 h-10 flex items-center justify-start">
                    <span className="material-symbols-outlined text-[#101322] dark:text-white transition-colors duration-500">arrow_back_ios</span>
                </Link>
                <h1 className="text-lg font-bold text-[#101322] dark:text-white transition-colors duration-500">Confidentialité</h1>
                <div className="w-10" />
            </header>

            <main className="max-w-lg mx-auto p-6 space-y-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <h2 className="text-2xl font-black text-[#D4AF37] mb-4">Politique de Confidentialité</h2>
                <p>Votre vie privée est notre priorité absolue.</p>

                <h3 className="text-lg font-bold text-[#101322] dark:text-white mt-6">1. Collecte des données</h3>
                <p>Nous collectons les informations que vous nous fournissez (nom, photos, préférences) et des données techniques pour améliorer l'application.</p>

                <h3 className="text-lg font-bold text-[#101322] dark:text-white mt-6">2. Utilisation des données</h3>
                <p>Vos données servent à vous proposer des profils pertinents. Nous ne vendons pas vos données personnelles.</p>

                <h3 className="text-lg font-bold text-[#101322] dark:text-white mt-6">3. Sécurité</h3>
                <p>Nous appliquons des mesures de sécurité strictes pour protéger vos informations.</p>

                <p className="mt-8 italic text-xs text-center opacity-70">Dernière mise à jour : Février 2026</p>
            </main>
        </div>
    );
}
