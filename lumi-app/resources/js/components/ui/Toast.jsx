import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const variants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.9 }
    };

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-[#D4AF37]' // Gold
    };

    const icons = {
        success: 'check_circle',
        error: 'error',
        info: 'info',
        warning: 'warning'
    };

    return (
        <motion.div
            layout
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg shadow-black/20 text-white min-w-[300px] backdrop-blur-md ${bgColors[type] || bgColors.info}`}
        >
            <span className="material-symbols-outlined text-[20px]">{icons[type]}</span>
            <p className="text-sm font-bold flex-1">{message}</p>
            <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
        </motion.div>
    );
};

export default Toast;
