import React from 'react';
import { classNames } from '../../utils/helpers';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    endContent?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, icon, endContent, ...props }, ref) => {
    return (
        <div className="relative">
            {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">{icon}</div>}
            <input
                ref={ref}
                className={classNames(
                    'block w-full px-4 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200',
                    icon ? 'pl-10' : '',
                    endContent ? 'pr-10' : '',
                    className
                )}
                {...props}
            />
            {endContent && <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{endContent}</div>}
        </div>
    );
});
Input.displayName = 'Input';