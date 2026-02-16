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

            {/* Header / Progress bar */}
            <div className="w-full pt-6 pb-10 flex items-center justify-between z-10">
                <button onClick={() => window.history.back()} className="size-10 flex items-center justify-center rounded-xl bg-[#161b2e] border border-white/10 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-gray-400 text-sm">arrow_back_ios</span>
                </button>
                <div className="flex-1 mx-8 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="w-4/5 h-full bg-[#D4AF37] rounded-full shadow-lg shadow-[#D4AF37]/30"></div>
                </div>
                <span className="text-[10px] font-black text-[#D4AF37] tracking-[0.2em] leading-none uppercase italic">04/05</span>
            </div>

            <div className="flex-1 flex flex-col space-y-8 z-10">
                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tighter text-white leading-none italic uppercase">
                        Ajoute tes plus <br /> belles photos
                    </h1>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed italic">Les profils avec au moins 3 photos reçoivent <br /> 5x plus d'attention exclusive.</p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                    {data.photos.map((img, idx) => (
                        <label
                            key={idx}
                            className={`aspect-[3/4] rounded-3xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all ${img ? 'border-transparent shadow-2xl' : 'border-white/5 bg-[#161b2e] hover:border-[#D4AF37]/30'
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
                                        className="absolute top-3 right-3 bg-[#101322]/80 backdrop-blur-md text-white rounded-full size-7 flex items-center justify-center shadow-lg z-20 hover:bg-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm font-black">close</span>
                                    </button>
                                </>
                            ) : (
                                <div className="text-gray-700 flex flex-col items-center">
                                    <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                                </div>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(idx, e)} />
                        </label>
                    ))}
                </div>

                {errors.photos && (
                    <p className="text-red-500 text-[10px] font-black uppercase text-center italic tracking-widest">{errors.photos}</p>
                )}

                <div className="bg-[#D4AF37]/5 p-5 rounded-[2rem] flex items-start space-x-4 mt-auto border border-[#D4AF37]/10">
                    <div className="text-[#D4AF37] mt-1">
                        <span className="material-symbols-outlined text-xl">blur_on</span>
                    </div>
                    <p className="text-[9px] text-gray-400 leading-relaxed font-black uppercase tracking-wider italic">
                        <strong>Protection Exclusive :</strong> Vos photos seront floues pour les autres membres <br /> jusqu'à ce qu'un match mutuel soit confirmé.
                    </p>
                </div>

                <div className="pb-10">
                    <button
                        onClick={handleSubmit}
                        disabled={processing || data.photos.filter(img => img !== null).length === 0}
                        className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 ${processing || data.photos.filter(img => img !== null).length === 0
                            ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                            : 'bg-[#D4AF37] text-[#101322] border border-[#D4AF37] hover:brightness-110 shadow-[#D4AF37]/20 uppercase italic font-black'
                            }`}
                    >
                        {processing ? (
                            <div className="flex items-center justify-center space-x-3">
                                <div className="size-4 border-2 border-[#101322]/30 border-t-[#101322] rounded-full animate-spin"></div>
                                <span>Envoi en cours...</span>
                            </div>
                        ) : 'Terminer mon profil'}
                    </button>
                </div>
            </div>
        </div>
    );
}
