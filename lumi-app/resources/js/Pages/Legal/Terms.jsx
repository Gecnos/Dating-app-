import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#101322] text-[#111218] dark:text-white font-sans pb-10">
            <Head title="Conditions Générales - Lumi" />

            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#101322]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <Link href={route('settings')} className="w-10 h-10 flex items-center justify-start">
                    <span className="material-symbols-outlined text-gray-800 dark:text-white">close</span>
                </Link>
                <h1 className="text-lg font-bold">Conditions Générales</h1>
                <div className="w-10" />
            </header>

            <main className="max-w-lg mx-auto p-6 prose dark:prose-invert prose-sm">
                <h3>1. Introduction</h3>
                <p>Bienvenue sur Lumi. En utilisant notre application, vous acceptez les présentes conditions d'utilisation.</p>

                <h3>2. Éligibilité</h3>
                <p>Vous devez avoir au moins 18 ans pour utiliser Lumi.</p>

                <h3>3. Sécurité</h3>
                <p>Nous ne tolérons aucun comportement abusif, harcèlement ou contenu inapproprié. Tout manquement entraînera un bannissement immédiat.</p>

                <h3>4. Achats In-App</h3>
                <p>Les crédits achetés sont non-remboursables et liés à votre compte.</p>

                {/* ... Add more realistic terms later ... */}
            </main>
        </div>
    );
}
