import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '../components/ui/Toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 3000, onClick) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type, duration, onClick }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = (msg, duration, onClick) => addToast(msg, 'success', duration, onClick);
    const error = (msg, duration, onClick) => addToast(msg, 'error', duration, onClick);
    const info = (msg, duration, onClick) => addToast(msg, 'info', duration, onClick);
    const warning = (msg, duration, onClick) => addToast(msg, 'warning', duration, onClick);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
            {children}
            
            {/* Toast Container */}
            <div className="fixed bottom-24 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
                <AnimatePresence mode='popLayout'>
                    {toasts.map(toast => (
                        <Toast
                            key={toast.id}
                            {...toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
