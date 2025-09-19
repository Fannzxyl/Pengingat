import React from 'react';
import { ICONS } from '../constants';
import { classNames } from '../utils/helpers';

type View = 'dashboard' | 'notes' | 'vault' | 'settings';

interface SidebarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    isMobileOpen: boolean;
    onClose: () => void;
}

const navItems: Array<{ key: View; label: string; icon: React.ReactNode }> = [
    { key: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard },
    { key: 'notes', label: 'Notes', icon: ICONS.notes },
    { key: 'vault', label: 'Vault', icon: ICONS.vault },
    { key: 'settings', label: 'Settings', icon: ICONS.settings },
];

const NavButton: React.FC<{
    item: (typeof navItems)[number];
    isActive: boolean;
    onClick: () => void;
}> = ({ item, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={classNames(
            'flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 backdrop-blur',
            isActive
                ? 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-500 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
        )}
    >
        <span className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/40 text-indigo-500 dark:bg-slate-800/60 dark:text-slate-100">
            {item.icon}
        </span>
        {item.label}
    </button>
);

function SidebarContent({ currentView, setCurrentView, onClose }: Pick<SidebarProps, "currentView" | "setCurrentView" | "onClose">) {
    return (
        <div className="flex h-full flex-col justify-between">
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">Azura</h1>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/50 text-slate-500 shadow-sm transition hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300/70 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800/70 lg:hidden"
                        aria-label="Tutup menu"
                    >
                        {ICONS.close}
                    </button>
                </div>
                <nav className="space-y-3">
                    {navItems.map(item => (
                        <NavButton
                            key={item.key}
                            item={item}
                            isActive={currentView === item.key}
                            onClick={() => setCurrentView(item.key)}
                        />
                    ))}
                </nav>
            </div>
            <div className="rounded-2xl border border-white/40 bg-white/60 p-4 text-xs text-slate-500 shadow-inner dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-300">
                <p>&copy; {new Date().getFullYear()} Azura</p>
                <p>Personal Memory &amp; Schedule Intelligence</p>
            </div>
        </div>
    );
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isMobileOpen, onClose }) => {
    return (
        <>
            <div
                className={classNames(
                    'fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden',
                    isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={classNames(
                    'fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] p-6 transition-transform duration-300 lg:hidden',
                    'border-r border-white/40 bg-white/70 shadow-2xl shadow-indigo-500/20 backdrop-blur-2xl dark:border-slate-800/60 dark:bg-slate-900/60',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <SidebarContent
                    currentView={currentView}
                    setCurrentView={setCurrentView}

                    onClose={onClose}
                />
            </aside>

            <aside className="hidden lg:flex lg:w-72 lg:flex-shrink-0 lg:flex-col lg:p-6">
                <div className="h-full rounded-3xl border border-white/40 bg-white/60 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl dark:border-slate-800/60 dark:bg-slate-900/60">
                    <SidebarContent
                        currentView={currentView}
                        setCurrentView={setCurrentView}

                        onClose={onClose}
                    />
                </div>
            </aside>
        </>
    );
};
