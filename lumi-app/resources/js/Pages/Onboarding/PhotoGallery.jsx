import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';

export default function PhotoGallery() {
    const { data, setData, post, processing, errors, transform } = useForm({
        photos: [null, null, null, null, null, null],
    });

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPhotos = [...data.photos];
                newPhotos[index] = reader.result;
                setData('photos', newPhotos);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        transform((formValues) => ({
            ...formValues,
            photos: formValues.photos.filter(img => img !== null)
        }));

        post('/onboarding/photos');
    };

    return (
        <div className="min-h-screen bg-[#101322] flex flex-col p-6 text-white font-['Be_Vietnam_Pro'] relative overflow-hidden">
            <Head title="Vos Photos" />

            {/* Benin Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(#E1AD01 0.5px, transparent 0.5px)',
                    backgroundSize: '24px 24px'
                }}>
            </div>

            <div className="w-full pt-4 pb-8 flex items-center justify-between z-10">
                <button onClick={() => window.history.back()} className="text-white/60 hover:text-[#E1AD01] transition-colors">
                    <span className="material-symbols-outlined">arrow_back_ios</span>
                </button>
                <div className="flex-1 mx-8 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-4/5 h-full bg-[#E1AD01] rounded-full shadow-[0_0_10px_rgba(225,173,1,0.5)]"></div>
                </div>
                <span className="text-xs font-bold text-[#E1AD01] tracking-widest leading-none">04/05</span>
            </div>

            <div className="flex-1 flex flex-col space-y-6 z-10">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight text-white leading-tight">Ajoute tes plus belles photos</h1>
                    <p className="text-white/60 text-sm font-medium leading-relaxed">Les profils avec au moins 3 photos reçoivent 5x plus de matchs. Lumi vérifie chaque photo pour ta sécurité.</p>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4">
                    {data.photos.map((img, idx) => (
                        <label
                            key={idx}
                            className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all ${img ? 'border-transparent shadow-xl' : 'border-white/10 bg-white/5 hover:border-[#E1AD01]/50'
                                } ${errors[`photos.${idx}`] ? 'border-red-500' : ''}`}
                        >
                            {img ? (
                                <>
                                    <img src={img} className="w-full h-full object-cover" alt="Profile" />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const n = [...data.photos];
                                            n[idx] = null;
                                            setData('photos', n);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-lg z-20"
                                    >
                                        <span className="material-symbols-outlined text-xs">close</span>
                                    </button>
                                </>
                            ) : (
                                <div className="text-white/20 flex flex-col items-center">
                                    <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                                </div>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(idx, e)} />
                        </label>
                    ))}
                </div>

                {errors.photos && (
                    <p className="text-red-500 text-xs font-bold text-center">{errors.photos}</p>
                )}

                <div className="bg-[#E1AD01]/10 p-4 rounded-2xl flex items-start space-x-3 mt-4 border border-[#E1AD01]/20">
                    <div className="text-[#E1AD01] mt-1">
                        <span className="material-symbols-outlined text-xl">blur_on</span>
                    </div>
                    <p className="text-[10px] text-white/60 leading-tight">
                        <strong>Mode Flou :</strong> Vos photos seront floues pour les autres membres jusqu'à ce qu'un match mutuel soit confirmé, préservant ainsi votre vie privée au Bénin.
                    </p>
                </div>

                <div className="mt-auto pb-8">
                    <button
                        onClick={handleSubmit}
                        disabled={processing || data.photos.filter(img => img !== null).length === 0}
                        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 ${processing || data.photos.filter(img => img !== null).length === 0
                            ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                            : 'bg-white text-[#101322] hover:bg-[#E1AD01]'
                            }`}
                    >
                        {processing ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-[#101322] border-t-transparent rounded-full animate-spin"></div>
                                <span>Envoi en cours...</span>
                            </div>
                        ) : 'Terminer mon profil'}
                    </button>
                </div>
            </div>
        </div>
    );
}
