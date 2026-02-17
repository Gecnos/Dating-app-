import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] text-[#101322] dark:text-white font-sans pb-10 transition-colors duration-500">
            <Head title="Conditions Générales - Lumi" />

            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#101322]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/10 transition-all duration-500">
                <Link href={route('settings')} className="w-10 h-10 flex items-center justify-start">
                    <span className="material-symbols-outlined text-[#101322] dark:text-white transition-colors duration-500">close</span>
                </Link>
                <h1 className="text-lg font-bold text-[#101322] dark:text-white transition-colors duration-500">Conditions Générales</h1>
                <div className="w-10" />
            </header>

            <main className="max-w-lg mx-auto p-6 prose dark:prose-invert prose-sm text-gray-600 dark:text-gray-400">
                <section className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-[#101322] dark:text-white">1. Introduction</h3>
                        <p>Bienvenue sur Lumi. En utilisant notre service, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser l'application.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#101322] dark:text-white">2. Éligibilité</h3>
                        <p>Vous devez avoir au moins 18 ans pour créer un compte sur Lumi et utiliser le Service. En créant un compte, vous garantissez que vous avez la capacité juridique de conclure un contrat contraignant.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#101322] dark:text-white">3. Utilisation du Service</h3>
                        <p>Lumi est une plateforme de rencontre destinée à un usage personnel. Vous vous engagez à ne pas :</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Fournir des informations fausses ou trompeuses.</li>
                            <li>Harceler, intimider ou diffamer d'autres utilisateurs.</li>
                            <li>Utiliser le service à des fins commerciales ou de prospection.</li>
                            <li>Publier du contenu offensant, haineux ou pornographique.</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#101322] dark:text-white">4. Sécurité du Compte</h3>
                        <p>Vous êtes responsable de maintenir la confidentialité de vos identifiants de connexion. Lumi n'est pas responsable des pertes résultant d'un accès non autorisé à votre compte.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#101322] dark:text-white">5. Achats et Crédits</h3>
                        <p>Lumi propose des fonctionnalités premium et des crédits virtuels. Tous les achats sont définitifs et non remboursables, sauf disposition contraire de la loi locale.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#101322] dark:text-white">6. Résiliation</h3>
                        <p>Lumi se réserve le droit de suspendre ou de résilier votre compte à tout moment, sans préavis, si vous violez les présentes conditions.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#101322] dark:text-white">7. Modification des Conditions</h3>
                        <p>Nous pouvons modifier ces conditions à tout moment. En continuant à utiliser le service après de telles modifications, vous acceptez les nouvelles conditions.</p>
                    </div>
                </section>
            </main>
        </div>
    );
}
