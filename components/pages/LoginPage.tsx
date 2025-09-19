import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ICONS } from '../../constants';
import { loginWithPasskey } from '../../utils/webauthn';
import { ensureDefaultUser, getStoredCredentials, verifyCredentials } from '../../services/authService';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('Alfan');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Ensure a default demo account exists and prefill the form for better UX
        (async () => {
            const stored = await ensureDefaultUser();
            if (stored) {
                setUsername(stored.username);
            } else {
                const credentials = getStoredCredentials();
                if (credentials) {
                    setUsername(credentials.username);
                }
            }
        })();
    }, []);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const isValid = await verifyCredentials(username, password);
            if (!isValid) {
                setError('Username atau password salah.');
                return;
            }
            onLoginSuccess();
        } catch (err) {
            console.error('Password login failed:', err);
            setError('Terjadi kesalahan saat masuk. Coba lagi dalam beberapa saat.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasskeyLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const success = await loginWithPasskey(username);
            if (success) {
                onLoginSuccess();
            } else {
                setError('Passkey tidak ditemukan untuk pengguna ini. Silakan daftarkan melalui halaman Settings.');
            }
        } catch (err: any) {
            setError(err?.message || 'Gagal masuk dengan passkey.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 px-4">
            <div className="w-full max-w-2xl grid lg:grid-cols-2 gap-6 bg-white/90 dark:bg-gray-900/80 backdrop-blur rounded-2xl shadow-xl border border-indigo-100 dark:border-gray-800 overflow-hidden">
                <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-700 text-white p-8">
                    <div>
                        <h1 className="text-4xl font-bold">Azura</h1>
                        <p className="mt-2 text-indigo-100">
                            Personal Memory Vault untuk menyimpan catatan, file, dan kredensial dengan aman.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                                {ICONS.shield}
                            </span>
                            <p className="text-sm text-indigo-100">
                                Semua data terenkripsi secara lokal menggunakan passphrase pribadi Anda.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                                {ICONS.sparkles}
                            </span>
                            <p className="text-sm text-indigo-100">
                                Gunakan Azura AI untuk merangkum catatan dan mendapatkan insight instan.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">Masuk ke Azura</h2>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            Gunakan akun demo Anda untuk melanjutkan: <span className="font-medium text-indigo-600 dark:text-indigo-300">Alfan / Adeefa123</span>
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handlePasswordLogin}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Username
                                </label>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    placeholder="Masukkan username"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="Masukkan password"
                                        className="pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                    >
                                        {showPassword ? ICONS.eyeOff : ICONS.eye}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && <p className="text-sm text-center text-red-500">{error}</p>}

                        <div className="space-y-3">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <span className="mr-2">{ICONS.spinner}</span>}
                                Masuk
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={handlePasskeyLogin}
                                disabled={isLoading}
                                type="button"
                            >
                                {isLoading ? <span className="mr-2">{ICONS.spinner}</span> : <span className="mr-2">{ICONS.fingerprint}</span>}
                                Masuk dengan Passkey
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
