import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ICONS } from '../../constants';
import { loginWithPasskey } from '../../utils/webauthn';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Mock username for passkey demo
    const username = 'Alfan';

    const handlePasswordLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        // Simulate a network request
        setTimeout(() => {
            // In a real app, you'd validate credentials here.
            // For this demo, any password login is successful.
            onLoginSuccess();
            setIsLoading(false);
        }, 1000);
    };

    const handlePasskeyLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const success = await loginWithPasskey(username);
            if (success) {
                onLoginSuccess();
            } else {
                setError('Passkey not found for this user. Please register one in Settings.');
            }
        } catch (err: any) {
             setError(err.message || 'Failed to log in with passkey.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">Aura</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Your Personal Memory Vault</p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handlePasswordLogin}>
                     <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="Email address (demo)"
                                defaultValue="alfan.adeefa@example.com"
                                className="rounded-t-md"
                            />
                        </div>
                        <div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="Password (demo)"
                                className="rounded-b-md"
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-center text-red-500">{error}</p>}

                    <div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <span className="mr-2">{ICONS.spinner}</span>}
                            Sign In
                        </Button>
                    </div>
                </form>

                 <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div>
                     <Button variant="secondary" className="w-full" onClick={handlePasskeyLogin} disabled={isLoading}>
                        {isLoading ? (
                            <span className="mr-2">{ICONS.spinner}</span>
                        ) : (
                           'Sign in with a Passkey'
                        )}
                    </Button>
                </div>

            </div>
        </div>
    );
};
