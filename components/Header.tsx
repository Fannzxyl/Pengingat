import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { QuickAddModal } from './QuickAddModal';

interface HeaderProps {
    toggleTheme: () => void;
    isDarkMode: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleTheme, isDarkMode, searchQuery, onSearchChange, onToggleSidebar }) => {
    const [isQuickAddOpen, setQuickAddOpen] = useState(false);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(event.target.value);
    };

    const clearSearch = () => {
        if (searchQuery !== '') {
            onSearchChange('');
        }
    };

    return (
        <>
            <header className="sticky top-0 z-30">
                <div className="px-4 sm:px-6">
                    <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-white/40 bg-white/60 p-4 shadow-lg shadow-indigo-500/10 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3 flex-1">
                            <button
                                type="button"
                                onClick={onToggleSidebar}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/40 bg-white/40 text-indigo-600 shadow-sm transition hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300/70 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/80 lg:hidden"
                                aria-label="Toggle navigation"
                            >
                                {ICONS.menu}
                            </button>
                            <div className="relative w-full">
                                <Input
                                    type="search"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Escape') {
                                            event.preventDefault();
                                            clearSearch();
                                        }
                                    }}
                                    placeholder="Cari catatan, koleksi, atau jadwal..."
                                    icon={ICONS.search}
                                    endContent={
                                        searchQuery ? (
                                            <button
                                                type="button"
                                                onMouseDown={(event) => event.preventDefault()}
                                                onClick={clearSearch}
                                                className="p-1 rounded-full text-slate-400 transition hover:text-slate-600 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/70"
                                                aria-label="Hapus pencarian"
                                            >
                                                {ICONS.close}
                                            </button>
                                        ) : null
                                    }
                                    className="bg-white/50 dark:bg-slate-900/50 border-white/40 dark:border-slate-800/60 placeholder-slate-500 dark:placeholder-slate-400"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button onClick={() => setQuickAddOpen(true)}>
                                <span className="mr-2">{ICONS.add}</span>
                                Quick Add
                            </Button>
                            <button
                                onClick={toggleTheme}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/40 bg-white/40 text-indigo-600 shadow-sm transition hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300/70 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/80"
                                aria-label="Toggle theme"
                            >
                                {isDarkMode ? ICONS.sun : ICONS.moon}
                            </button>
                            <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-400 to-sky-500 text-white font-semibold shadow-lg shadow-indigo-500/30">
                                AZ
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setQuickAddOpen(false)} />
        </>
    );
};
