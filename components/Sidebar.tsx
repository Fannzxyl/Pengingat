import React from 'react';
import { ICONS } from '../constants';
import { classNames } from '../utils/helpers';

type View = 'dashboard' | 'notes' | 'vault' | 'settings';

interface SidebarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={classNames(
            'flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200',
            isActive
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        )}
    >
        <span className="mr-3">{icon}</span>
        {label}
    </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800/50 p-4 flex flex-col justify-between border-r border-gray-200 dark:border-gray-700">
            <div>
                <div className="flex items-center justify-center h-16 mb-6">
                    <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Aura</h1>
                </div>
                <nav className="space-y-2">
                    <NavItem
                        icon={ICONS.dashboard}
                        label="Dashboard"
                        isActive={currentView === 'dashboard'}
                        onClick={() => setCurrentView('dashboard')}
                    />
                    <NavItem
                        icon={ICONS.notes}
                        label="Notes"
                        isActive={currentView === 'notes'}
                        onClick={() => setCurrentView('notes')}
                    />
                    <NavItem
                        icon={ICONS.vault}
                        label="Vault"
                        isActive={currentView === 'vault'}
                        onClick={() => setCurrentView('vault')}
                    />
                    <NavItem
                        icon={ICONS.settings}
                        label="Settings"
                        isActive={currentView === 'settings'}
                        onClick={() => setCurrentView('settings')}
                    />
                </nav>
            </div>
            <div className="text-center text-xs text-gray-500">
                <p>&copy; {new Date().getFullYear()} Aura</p>
                <p>Your Personal Memory Vault</p>
            </div>
        </aside>
    );
};
