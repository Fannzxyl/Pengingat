import React, { useState, useEffect } from 'react';
import { createPasskey, getPasskeyForUser, startPasskeyLogin } from '../../utils/webauthn';
import { ICONS } from '../../constants';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('Alfan'); // Default for demo
    const [hasPasskey, setHasPasskey] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    useEffect(() => {
        if (username) {
            setHasPasskey(!!getPasskeyForUser(username));
        }
    }, [username]);

    const handleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const success = await startPasskeyLogin(username);
            if (success) {
                onLoginSuccess();
            } else {
                setError('Login failed. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        setIsLoading(true);
        setError('');
        try {
            await createPasskey(username);
            setHasPasskey(true);
            // Optionally auto-login after registration
            await handleLogin();
        } catch (err: any) {
            setError(err.message || 'Failed to register passkey.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) {
            setError('Username is required.');
            return;
        }
        if (hasPasskey) {
            handleLogin();
        } else {
            handleRegister();
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-gray-800">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Aura</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Your Personal Memory Vault</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                     <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                           Username
                        </label>
                        <div className="mt-1">
                           <Input
                               id="username"
                               name="username"
                               type="text"
                               autoComplete="username webauthn"
                               required
                               value={username}
                               onChange={(e) => setUsername(e.target.value)}
                               placeholder="Enter your username"
                           />
                        </div>
                    </div>
                     {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <div>
                        <Button type="submit" className="w-full" disabled={isLoading || !username}>
                            {isLoading && <span className="mr-2">{ICONS.spinner}</span>}
                            {hasPasskey ? 'Login with Passkey' : 'Register and Login with Passkey'}
                        </Button>
                    </div>
                    <p className="text-xs text-center text-gray-500">
                        This uses passwordless authentication (WebAuthn). No passwords are stored.
                    </p>
                </form>
            </div>
        </div>
    );
};
