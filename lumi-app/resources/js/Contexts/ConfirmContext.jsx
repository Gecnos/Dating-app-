import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const ConfirmContext = createContext();

export const useConfirm = () => {
    return useContext(ConfirmContext);
};

export const ConfirmProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        onCancel: () => {},
        isDangerous: false,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
    });

    const confirm = useCallback(({ 
        title, 
        message, 
        onConfirm, 
        onCancel, 
        isDangerous = false, 
        confirmText = 'Confirmer', 
        cancelText = 'Annuler' 
    }) => {
        setModalState({
            isOpen: true,
            title,
            message,
            onConfirm: async () => {
                if (onConfirm) await onConfirm();
                setModalState(prev => ({ ...prev, isOpen: false }));
            },
            onCancel: () => {
                if (onCancel) onCancel();
                setModalState(prev => ({ ...prev, isOpen: false }));
            },
            isDangerous,
            confirmText,
            cancelText
        });
    }, []);

    const close = useCallback(() => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <ConfirmContext.Provider value={{ confirm, close }}>
            {children}
            {modalState.isOpen && (
                <ConfirmationModal
                    isOpen={modalState.isOpen}
                    title={modalState.title}
                    message={modalState.message}
                    onConfirm={modalState.onConfirm}
                    onCancel={modalState.onCancel}
                    isDangerous={modalState.isDangerous}
                    confirmText={modalState.confirmText}
                    cancelText={modalState.cancelText}
                />
            )}
        </ConfirmContext.Provider>
    );
};
