import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirmer", cancelText = "Annuler", isDangerous = false }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                    onClick={onCancel}
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-white dark:bg-[#161b2e] w-full max-w-sm rounded-[2.5rem] p-8 border border-black/5 dark:border-white/10 shadow-2xl transition-colors duration-500"
                >
                    <h3 className="text-xl font-black italic tracking-tight mb-4 text-[#101322] dark:text-white text-center">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center leading-relaxed">
                        {message}
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={onCancel} 
                            className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-white/10 font-bold text-xs uppercase text-[#101322] dark:text-white transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={onConfirm} 
                            className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg ${isDangerous ? 'bg-red-500 shadow-red-500/30' : 'bg-[#D4AF37] shadow-[#D4AF37]/30'}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
