import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Help() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Aide & Support - Lumi";
    }, []);

    const faqs = [
        {
            q: "Comment changer ma photo de profil ?",
            a: "Allez sur votre profil, cliquez sur 'Modifier le profil' puis sur l'icône de caméra sur votre photo actuelle."
        },
        {
            q: "Comment fonctionne le mode fantôme ?",
            a: "Le mode fantôme vous rend invisible aux autres utilisateurs. Vous pouvez continuer à swiper, mais vous ne serez vu que par les personnes que vous avez likées."
        },
        {
            q: "C'est quoi les crédits Lumi ?",
            a: "Les crédits permettent d'accéder à des fonctionnalités premium comme voir qui vous a liké, envoyer des super likes, etc."
        },
        {
            q: "Comment supprimer mon compte ?",
            a: "Allez dans Paramètres > Supprimer mon compte (en bas de page). Attention, cette action est irréversible."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] text-[#101322] dark:text-white font-['Be_Vietnam_Pro'] pb-10 transition-colors duration-500">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#101322]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/10 transition-all duration-500">
                <Link to="/settings" className="w-10 h-10 flex items-center justify-start">
                    <span className="material-symbols-outlined text-[#101322] dark:text-white transition-colors duration-500">arrow_back_ios</span>
                </Link>
                <h1 className="text-lg font-bold text-[#101322] dark:text-white transition-colors duration-500">Centre d'aide</h1>
                <div className="w-10" />
            </header>

            <main className="max-w-lg mx-auto p-6 space-y-8">
                {/* Contact Support */}
                <div className="bg-[#D4AF37] rounded-3xl p-6 text-white shadow-lg shadow-[#D4AF37]/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">support_agent</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-white">Besoin d'aide ?</h2>
                            <p className="text-xs text-white/90">Notre équipe est là pour vous 24/7</p>
                        </div>
                    </div>
                    <button className="w-full py-3 bg-white text-[#D4AF37] font-bold rounded-xl text-sm active:scale-95 transition-all shadow-lg shadow-black/10">
                        Contacter le support
                    </button>
                </div>

                {/* FAQs */}
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-4 ml-2 transition-colors duration-500">Questions Fréquentes</h3>
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white dark:bg-[#161b2e] p-5 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 transition-colors duration-500">
                                <h4 className="font-bold text-sm mb-2 text-[#D4AF37]">{faq.q}</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
