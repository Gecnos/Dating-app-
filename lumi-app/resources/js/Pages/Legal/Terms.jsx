import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Terms() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Conditions Générales d'Utilisation - Lumi";
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] text-[#101322] dark:text-white font-['Be_Vietnam_Pro'] pb-10 transition-colors duration-500">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#101322]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/10 transition-all duration-500">
                <Link to="/settings" className="w-10 h-10 flex items-center justify-start">
                    <span className="material-symbols-outlined text-[#101322] dark:text-white transition-colors duration-500">arrow_back_ios</span>
                </Link>
                <h1 className="text-lg font-bold text-[#101322] dark:text-white transition-colors duration-500">CGU</h1>
                <div className="w-10" />
            </header>

            <main className="max-w-lg mx-auto p-6 space-y-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <h2 className="text-2xl font-black text-[#D4AF37] mb-4">Conditions Générales d'Utilisation</h2>
                <p>Bienvenue sur Lumi, l'application de rencontre 100% béninoise.</p>

                <h3 className="text-lg font-bold text-[#101322] dark:text-white mt-6">1. Acceptation des conditions</h3>
                <p>En téléchargeant ou en utilisant l'application, ces termes s'appliqueront automatiquement à vous – vous devez donc vous assurer de les lire attentivement avant d'utiliser l'application.</p>

                <h3 className="text-lg font-bold text-[#101322] dark:text-white mt-6">2. Règles de conduite</h3>
                <p>Vous vous engagez à ne pas utiliser le service pour des activités illégales ou non autorisées. Le harcèlement, les discours haineux et le contenu explicite non sollicité sont strictement interdits.</p>

                <h3 className="text-lg font-bold text-[#101322] dark:text-white mt-6">3. Responsabilité</h3>
                <p>Lumi ne peut être tenu responsable des interactions entre utilisateurs hors de la plateforme. Soyez prudents lors de vos rencontres.</p>

                <p className="mt-8 italic text-xs text-center opacity-70">Dernière mise à jour : Février 2026</p>
            </main>
        </div>
    );
}
