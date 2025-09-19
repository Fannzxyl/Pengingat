import React from 'react';
import { classNames } from '../../utils/helpers';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    endContent?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, icon, endContent, ...props }, ref) => {
    return (
        <div className="relative">
            {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-400 dark:text-indigo-300/80">{icon}</div>}
            <input
                ref={ref}
                className={classNames(
                    'block w-full px-4 py-2.5 rounded-xl bg-white/60 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 border border-white/50 dark:border-slate-800/60 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-300/60 focus:border-transparent placeholder-slate-500 dark:placeholder-slate-400 transition duration-200',
                    icon ? 'pl-11' : '',
                    endContent ? 'pr-11' : '',
                    className
                )}
                {...props}
            />
            {endContent && <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{endContent}</div>}
        </div>
    );
});
Input.displayName = 'Input';
