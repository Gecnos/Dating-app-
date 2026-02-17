import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] text-[#101322] dark:text-white font-sans pb-10 transition-colors duration-500">
            <Head title="Politique de Confidentialité - Lumi" />

            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#101322]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/10 transition-all duration-500">
                <Link href={route('settings')} className="w-10 h-10 flex items-center justify-start">
                    <span className="material-symbols-outlined text-[#101322] dark:text-white transition-colors duration-500">close</span>
                </Link>
                <h1 className="text-lg font-bold text-[#101322] dark:text-white transition-colors duration-500">Confidentialité</h1>
                <div className="w-10" />
            </header>

            <main className="max-w-lg mx-auto p-6 prose dark:prose-invert prose-sm text-gray-600 dark:text-gray-400">
                <section className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-[#101322] dark:text-white">1. Collecte des données</h3>
                        <p>Nous collectons les informations que vous nous fournissez lors de votre inscription, notamment :</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Informations de profil (nom, âge, sexe, photos, bio).</li>
                            <li>Données de localisation (pour vous proposer des profils proches).</li>
                            <li>Communications au sein de l'application.</li>
                            <li>Données d'utilisation et préférences techniques.</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#101322] dark:text-white">2. Utilisation des données</h3>
                        <p>Vos données sont utilisées pour :</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Faire fonctionner le service de mise en relation.</li>
                            <li>Assurer la sécurité de la communauté.</li>
                            <li>Améliorer l'expérience utilisateur et les fonctionnalités.</li>
                            <li>Vous envoyer des notifications importantes.</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#101322] dark:text-white">3. Partage des données</h3>
                        <p>Lumi ne vend pas vos données personnelles. Nous partageons vos informations uniquement avec des prestataires de services tiers nécessaires au fonctionnement (ex: hébergement) ou si la loi l'exige.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#101322] dark:text-white">4. Vos droits</h3>
                        <p>Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez exercer ces droits directement depuis les paramètres de votre compte.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#101322] dark:text-white">5. Sécurité</h3>
                        <p>Nous mettons en œuvre des mesures de sécurité rigoureuses pour protéger vos données contre tout accès non autorisé ou toute divulgation.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#101322] dark:text-white">6. Conservation des données</h3>
                        <p>Nous conservons vos données tant que votre compte est actif. En cas de suppression de compte, vos données sont anonymisées ou supprimées après un délai raisonnable de traitement.</p>
                    </div>
                </section>
            </main>
        </div>
    );
}
