import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/pages/Dashboard';
import { NotesView } from './components/pages/NotesView';
import { VaultView } from './components/pages/VaultView';
import { SettingsPage } from './components/pages/SettingsPage';
import { LoginPage } from './components/pages/LoginPage';
import { VaultProvider } from './hooks/useVault';
import { AiChatPanel } from './components/AiChatPanel';
import { ICONS } from './constants';

type View = 'dashboard' | 'notes' | 'vault' | 'settings';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem('theme') === 'dark';
        }
        return false;
    });
    const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard searchQuery={searchQuery} />;
            case 'notes':
                return <NotesView searchQuery={searchQuery} />;
            case 'vault':
                return <VaultView />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <Dashboard searchQuery={searchQuery} />;
        }
    };

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newTheme = !prev ? 'dark' : 'light';
            window.localStorage.setItem('theme', newTheme);
            document.documentElement.classList.toggle('dark', !prev);
            return !prev;
        });
    };

    React.useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    const toggleAiAssistant = () => {
        setIsAiAssistantOpen(prev => !prev);
    };

    const handleViewChange = (view: View) => {
        setCurrentView(view);
        setIsSidebarOpen(false);
    };

    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <VaultProvider>
            <div className="relative flex min-h-screen bg-gradient-to-br from-slate-100 via-indigo-100/70 to-sky-100 dark:from-slate-950 dark:via-indigo-950/80 dark:to-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-500">
                <div
                    className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_62%)]"
                    aria-hidden="true"
                />

                <Sidebar
                    currentView={currentView}
                    setCurrentView={handleViewChange}
                    isMobileOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                <div className="relative flex-1 flex flex-col overflow-hidden">
                    <Header
                        toggleTheme={toggleTheme}
                        isDarkMode={isDarkMode}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                    />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto">
                        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                            {renderView()}
                        </div>
                    </main>
                </div>

                <button
                    type="button"
                    onClick={toggleAiAssistant}
                    className="fixed bottom-6 right-4 sm:right-6 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-500 text-white px-5 py-3 shadow-2xl shadow-indigo-500/40 hover:from-indigo-500 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300/70 dark:focus:ring-offset-slate-900"
                >
                    <span className="h-5 w-5 flex items-center justify-center">{ICONS.sparkles}</span>
                    {isAiAssistantOpen ? 'Tutup Azura' : 'Buka Azura AI'}
                </button>

                {isAiAssistantOpen && (
                    <div className="fixed bottom-24 right-4 sm:right-6 z-40 w-[calc(100%-2rem)] max-w-xl">
                        <AiChatPanel onClose={() => setIsAiAssistantOpen(false)} />
                    </div>
                )}
            </div>
        </VaultProvider>
    );
};

export default App;
