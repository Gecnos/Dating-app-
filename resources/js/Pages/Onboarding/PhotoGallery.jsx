import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../contexts/AuthProvider';

export default function PhotoGallery() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [photos, setPhotos] = useState([null, null, null, null, null, null]);
    const [photoFiles, setPhotoFiles] = useState([null, null, null, null, null, null]);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPhotos = [...photos];
                newPhotos[index] = reader.result; // Preview URL
                setPhotos(newPhotos);

                const newPhotoFiles = [...photoFiles];
                newPhotoFiles[index] = file; // Actual file
                setPhotoFiles(newPhotoFiles);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = (index, e) => {
        e.preventDefault();
        const newPhotos = [...photos];
        newPhotos[index] = null;
        setPhotos(newPhotos);

        const newPhotoFiles = [...photoFiles];
        newPhotoFiles[index] = null;
        setPhotoFiles(newPhotoFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        const validFiles = photoFiles.filter(file => file !== null);

        validFiles.forEach((file) => {
            formData.append('photos[]', file);
        });

        try {
            const response = await axios.post('/onboarding/photos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.user) {
                const token = localStorage.getItem('auth_token');
                login(token, response.data.user);
            }

            // Onboarding completed, go to Discovery (or next_step if any)
            navigate('/discovery');
        } catch (err) {
            console.error(err);
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] flex flex-col p-6 text-[#101322] dark:text-white font-['Be_Vietnam_Pro'] relative overflow-hidden transition-colors duration-500">
            {/* Benin Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(#E1AD01 0.5px, transparent 0.5px)',
                    backgroundSize: '24px 24px'
                }}>
            </div>

            {/* Header / Progress bar */}
            <div className="w-full pt-6 pb-10 flex items-center justify-between z-10 transition-all duration-500">
                <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#161b2e] border border-black/5 dark:border-white/10 active:scale-90 transition-all transition-colors duration-500 shadow-sm dark:shadow-none">
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm">arrow_back_ios</span>
                </button>
                <div className="flex-1 mx-8 h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5 transition-colors duration-500">
                    <div className="w-4/5 h-full bg-[#D4AF37] rounded-full shadow-lg shadow-[#D4AF37]/30 transition-all duration-500"></div>
                </div>
                <span className="text-[10px] font-black text-[#D4AF37] tracking-[0.2em] leading-none uppercase italic">04/05</span>
            </div>

            <div className="flex-1 flex flex-col space-y-8 z-10">
                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tighter text-[#101322] dark:text-white leading-none italic uppercase transition-colors duration-500">
                        Ajoute tes plus <br /> belles photos
                    </h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm font-medium leading-relaxed italic transition-colors duration-500">Les profils avec au moins 3 photos reçoivent <br /> 5x plus d'attention exclusive.</p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                    {photos.map((img, idx) => (
                        <label
                            key={idx}
                            className={`aspect-[3/4] rounded-3xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all transition-colors duration-500 ${img ? 'border-transparent shadow-2xl' : 'border-black/5 dark:border-white/5 bg-white dark:bg-[#161b2e] hover:border-[#D4AF37]/30 shadow-sm dark:shadow-none'
                                } ${errors[`photos.${idx}`] ? 'border-red-500' : ''}`}
                        >
                            {img ? (
                                <>
                                    <img src={img} className="w-full h-full object-cover" alt="Profile" />
                                    <button
                                        onClick={(e) => removePhoto(idx, e)}
                                        className="absolute top-3 right-3 bg-[#101322]/80 backdrop-blur-md text-white rounded-full size-7 flex items-center justify-center shadow-lg z-20 hover:bg-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm font-black">close</span>
                                    </button>
                                </>
                            ) : (
                                <div className="text-gray-200 dark:text-gray-700 flex flex-col items-center transition-colors duration-500">
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

                <div className="pb-10">
                    <button
                        onClick={handleSubmit}
                        disabled={processing || photos.filter(img => img !== null).length === 0}
                        className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 transition-colors duration-500 ${processing || photos.filter(img => img !== null).length === 0
                            ? 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-white/20 cursor-not-allowed border border-black/5 dark:border-white/5 shadow-none font-bold'
                            : 'bg-[#D4AF37] text-white dark:text-[#101322] border border-[#D4AF37] hover:brightness-110 shadow-[#D4AF37]/20 uppercase italic font-black shadow-[#D4AF37]/30'
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
