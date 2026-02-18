import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function PhotoManagement() {
    const navigate = useNavigate();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/photos/manage');
            setPhotos(response.data.photos || []);
        } catch (error) {
            console.error("Error fetching photos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            try {
                const response = await axios.post('/api/photos/add', { photo: reader.result });
                // Add new photo locally or refresh
                setPhotos(prev => [...prev, response.data.photo]);
            } catch (err) {
                console.error(err);
                alert("Erreur lors de l'ajout de la photo");
            } finally {
                setUploading(false);
            }
        };
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette photo ?")) return;
        try {
            await axios.delete(`/api/photos/${id}`);
            setPhotos(photos.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleReorder = async (newPhotos) => {
        setPhotos(newPhotos);
        try {
            await axios.post('/api/photos/reorder', {
                photo_ids: newPhotos.map(p => p.id)
            });
        } catch (err) {
            console.error(err);
        }
    };

    const movePhoto = (dragIndex, hoverIndex) => {
        const draggedPhoto = photos[dragIndex];
        const newPhotos = [...photos];
        newPhotos.splice(dragIndex, 1);
        newPhotos.splice(hoverIndex, 0, draggedPhoto);
        handleReorder(newPhotos);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#101322]">
                <div className="size-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] text-[#101322] dark:text-white font-['Be_Vietnam_Pro'] pb-32 transition-colors duration-500">
            {/* Header */}
            <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b bg-white/90 dark:bg-[#101322]/90 border-black/5 dark:border-white/10 backdrop-blur-xl transition-all">
                <Link to="/profile/edit" className="w-10 h-10 flex items-center justify-start text-[#101322] dark:text-white">
                    <span className="material-symbols-outlined">arrow_back_ios</span>
                </Link>
                <h1 className="text-lg font-bold text-[#101322] dark:text-white">Mes Photos</h1>
                <div className="w-10" />
            </header>

            <main className="max-w-lg mx-auto p-6 space-y-8">
                <div className="text-center space-y-2">
                    <p className="text-xs text-gray-500 px-4">
                        La première photo sera votre photo de profil principale.
                        Vous pouvez en ajouter jusqu'à 9.
                    </p>
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <AnimatePresence>
                        {photos.map((photo, index) => (
                            <motion.div
                                key={photo.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 group group shadow-sm transition-all shadow-lg shadow-black/5"
                            >
                                <img src={photo.url} className="w-full h-full object-cover" alt={`Photo ${index + 1}`} />

                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDelete(photo.id)}
                                    className="absolute top-2 right-2 size-7 bg-black/40 hover:bg-red-500 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>

                                {/* Position Badge */}
                                <div className={`absolute bottom-2 left-2 size-6 rounded-full flex items-center justify-center text-[10px] font-black italic shadow-lg ${index === 0 ? 'bg-[#D4AF37] text-[#101322]' : 'bg-white/20 backdrop-blur-md text-white'}`}>
                                    {index + 1}
                                </div>

                                {/* Reorder actions (simplified for mobile: arrows) */}
                                <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all bg-black/20 backdrop-blur-[2px]">
                                    {index > 0 && (
                                        <button onClick={() => movePhoto(index, index - 1)} className="size-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-[#D4AF37]">
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>
                                    )}
                                    {index < photos.length - 1 && (
                                        <button onClick={() => movePhoto(index, index + 1)} className="size-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-[#D4AF37]">
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add Photo Placeholder */}
                    {photos.length < 9 && (
                        <button
                            onClick={() => !uploading && document.getElementById('photo-upload').click()}
                            disabled={uploading}
                            className="relative aspect-[3/4] rounded-3xl border-2 border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all text-gray-400 hover:text-[#D4AF37]"
                        >
                            <div className="size-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-1">
                                <span className="material-symbols-outlined">{uploading ? 'sync' : 'add'}</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Ajouter</span>
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </button>
                    )}
                </div>

                {/* Quick Info */}
                <div className="p-6 rounded-[2.5rem] bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20">
                    <div className="flex gap-4">
                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">info</span>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-amber-900 dark:text-amber-100 italic">Astuce Premium</p>
                            <p className="text-[10px] text-amber-800/70 dark:text-amber-300/60 leading-relaxed">
                                Les profils avec au moins 3 photos reçoivent 5x plus de likes.
                                Montrez votre plus beau sourire !
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
