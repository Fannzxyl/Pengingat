import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/pages/Dashboard';
import { NotesView } from './components/pages/NotesView';
import { VaultView } from './components/pages/VaultView';
import { SettingsPage } from './components/pages/SettingsPage';
import { LoginPage } from './components/pages/LoginPage';
import { VaultProvider } from './hooks/useVault';

type View = 'dashboard' | 'notes' | 'vault' | 'settings';

const App: React.FC = () => {
    // In a real app, this would be determined by an auth provider
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentView, setCurrentView] = useState<View>('dashboard');

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard />;
            case 'notes':
                return <NotesView />;
            case 'vault':
                return <VaultView />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <Dashboard />;
        }
    };
    
    // Simple dark mode toggle for demonstration
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem('theme') === 'dark';
        }
        return false;
    });

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

    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <VaultProvider>
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
                        <div className="container mx-auto px-6 py-8">
                            {renderView()}
                        </div>
                    </main>
                </div>
            </div>
        </VaultProvider>
    );
};

export default App;
