import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import { classNames } from '../../utils/helpers';

export interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastProps {
    toast: ToastMessage;
    onDismiss: (id: number) => void;
}

const toastIcons = {
    success: ICONS.check,
    error: ICONS.close, // Using close icon for error
    info: ICONS.bot, // Using bot icon for info
};

const toastColors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 5000); // Auto-dismiss after 5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [toast, onDismiss]);

    return (
        <div className={classNames(
            "max-w-sm w-full rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden",
            toastColors[toast.type]
        )}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {toastIcons[toast.type]}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium">{toast.message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={() => onDismiss(toast.id)}
                            className="inline-flex rounded-md text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <span className="sr-only">Close</span>
                            {ICONS.close}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
