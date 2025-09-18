import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { QuickAddModal } from './QuickAddModal';

interface HeaderProps {
    toggleTheme: () => void;
    isDarkMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({ toggleTheme, isDarkMode }) => {
    const [isQuickAddOpen, setQuickAddOpen] = useState(false);
    
    return (
        <>
            <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                    <div className="relative w-full max-w-xs">
                        <Input
                            type="search"
                            placeholder="Search notes, files, vault..."
                            icon={ICONS.search}
                            className="pr-4"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button onClick={() => setQuickAddOpen(true)}>
                        <span className="mr-2">{ICONS.add}</span>
                        Quick Add
                    </Button>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {isDarkMode ? ICONS.sun : ICONS.moon}
                    </button>
                    <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                        A
                    </div>
                </div>
            </header>
            <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setQuickAddOpen(false)} />
        </>
    );
};
