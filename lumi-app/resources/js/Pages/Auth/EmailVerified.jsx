import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

// Landing page for the signed email-verification link (LoginController::verifyEmail
// redirects here). Deliberately public/standalone: the link is often opened on a
// different device/browser than the one the user is logged in on, so this can't
// assume an authenticated SPA session is present.
export default function EmailVerified() {
    const [params] = useSearchParams();
    const success = params.get('status') !== 'invalid';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] font-['Be_Vietnam_Pro'] text-[#101322] dark:text-white flex flex-col items-center justify-center text-center px-6 space-y-6 transition-colors duration-500">
            <span className={`material-symbols-outlined text-6xl ${success ? 'text-[#D4AF37]' : 'text-red-500'}`}>
                {success ? 'mark_email_read' : 'error'}
            </span>
            <div>
                <h1 className="text-xl font-black uppercase italic tracking-tighter mb-2">
                    {success ? 'Email vérifié !' : 'Lien invalide'}
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                    {success
                        ? 'Votre adresse email a bien été confirmée.'
                        : "Ce lien de vérification n'est plus valide."}
                </p>
            </div>
            <Link to="/login" className="text-[#D4AF37] text-xs font-black uppercase tracking-widest hover:underline">
                Retour à Lumi
            </Link>
        </div>
    );
}
