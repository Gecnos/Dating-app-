import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#101322] text-[#111218] dark:text-white font-sans pb-10">
            <Head title="Politique de Confidentialité - Lumi" />

            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#101322]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <Link href={route('settings')} className="w-10 h-10 flex items-center justify-start">
                    <span className="material-symbols-outlined text-gray-800 dark:text-white">close</span>
                </Link>
                <h1 className="text-lg font-bold">Confidentialité</h1>
                <div className="w-10" />
            </header>

            <main className="max-w-lg mx-auto p-6 prose dark:prose-invert prose-sm">
                <h3>1. Collecte des données</h3>
                <p>Nous collectons les informations que vous nous fournissez (nom, photos, bio) ainsi que votre localisation pour vous proposer des profils pertinents.</p>

                <h3>2. Utilisation des données</h3>
                <p>Vos données servent uniquement au fonctionnement de l'application. Nous ne revendons pas vos données à des tiers.</p>

                <h3>3. Suppression des données</h3>
                <p>Vous pouvez demander la suppression de votre compte et de toutes vos données à tout moment depuis les paramètres.</p>
            </main>
        </div>
    );
}
