import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ICONS } from '../../constants';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xl px-4"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="relative w-full max-w-xl rounded-3xl border border-white/40 bg-white/70 p-6 shadow-2xl shadow-indigo-500/20 backdrop-blur-2xl dark:border-slate-800/60 dark:bg-slate-900/70"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between pb-4 border-b border-white/50 dark:border-slate-800/60">
                    <h2 id="modal-title" className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 rounded-xl bg-white/60 transition hover:bg-white/70 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300/70 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800/80"
                        aria-label="Close modal"
                    >
                        {ICONS.close}
                    </button>
                </div>
                <div className="mt-4">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
