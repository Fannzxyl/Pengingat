import React from 'react';
import { classNames } from '../../utils/helpers';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    className,
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed backdrop-blur';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-500 text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-500 hover:to-sky-600 focus:ring-indigo-300/70',
        secondary: 'bg-white/60 text-slate-700 border border-white/50 shadow-sm hover:bg-white/80 focus:ring-indigo-200/70 dark:bg-slate-900/50 dark:text-slate-100 dark:border-slate-800/60 dark:hover:bg-slate-900/70',
        danger: 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30 hover:from-rose-500 hover:to-orange-600 focus:ring-rose-300/60',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={classNames(baseClasses, variantClasses[variant], sizeClasses[size], className)}
            {...props}
        >
            {children}
        </button>
    );
};
