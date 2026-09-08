import React from 'react';
import { Link } from 'react-router-dom';

export default function Terms() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#101322] text-[#101322] dark:text-white font-sans transition-colors duration-500">
            <header className="px-6 py-6 border-b border-black/5 dark:border-white/10 sticky top-0 bg-white/80 dark:bg-[#101322]/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-4">
                    <Link to="/settings" className="size-10 rounded-xl bg-gray-100 dark:bg-[#1a1f35] flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back_ios_new</span>
                    </Link>
                    <h1 className="text-xl font-black uppercase italic tracking-tighter">Mentions Légales</h1>
                </div>
            </header>

            <main className="p-6 max-w-3xl mx-auto space-y-8 pb-24">
                <section>
                    <h2 className="text-lg font-black text-[#D4AF37] mb-4">1. Éditeur du Site</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Le site et l'application <strong>Lumi</strong> sont édités par :<br /><br />
                        <strong>Nom de la Société / Éditeur :</strong> [À COMPLÉTER]<br />
                        <strong>Forme Juridique :</strong> [SASU / EURL / etc.]<br />
                        <strong>Adresse du Siège Social :</strong> [Adresse complète]<br />
                        <strong>Capital Social :</strong> [Montant] €<br />
                        <strong>Immatriculation :</strong> RCS [Ville] B [Numéro SIREN]<br />
                        <strong>Numéro TVA Intracommunautaire :</strong> [Numéro]<br />
                        <strong>Directeur de la Publication :</strong> [Nom du Directeur]
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-black text-[#D4AF37] mb-4">2. Hébergement</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        L'application est hébergée par :<br /><br />
                        <strong>Hébergeur :</strong> [Vercel / AWS / OVH / DigitalOcean]<br />
                        <strong>Adresse :</strong> [Adresse de l'hébergeur]<br />
                        <strong>Contact :</strong> [Lien ou mail support hébergeur]
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-black text-[#D4AF37] mb-4">3. Propriété Intellectuelle</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        L'ensemble des contenus (textes, images, base de données, algorithmes, design) présents sur Lumi sont la propriété exclusive de l'éditeur ou de ses partenaires. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-black text-[#D4AF37] mb-4">4. Données Personnelles (RGPD)</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, vous pouvez nous contacter à l'adresse suivante : <strong>privacy@lumi.app</strong> ou via les paramètres de l'application.<br /><br />
                        Pour plus de détails, veuillez consulter notre <Link to="/legal/privacy" className="text-[#D4AF37] underline">Politique de Confidentialité</Link>.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-black text-[#D4AF37] mb-4">5. Contact</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Pour toute question ou demande d'information, vous pouvez nous contacter par email à : <strong>contact@lumi.app</strong>
                    </p>
                </section>
            </main>
        </div>
    );
}
