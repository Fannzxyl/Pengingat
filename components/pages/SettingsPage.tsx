import React, { useState, useEffect } from 'react';
import { useVault } from '../../hooks/useVault';
import { Button } from '../ui/Button';
import { ChangePassphraseModal } from '../ChangePassphraseModal';
import { createPasskey, getPasskeyForUser } from '../../utils/webauthn';
import { ICONS } from '../../constants';

export const SettingsPage: React.FC = () => {
    const { isUnlocked, lockVault } = useVault();
    const [isChangePassphraseOpen, setChangePassphraseOpen] = useState(false);
    
    // Passkey state
    const [passkeyStatus, setPasskeyStatus] = useState<'unknown' | 'registered' | 'none'>('unknown');
    const [isRegistering, setIsRegistering] = useState(false);
    const [registerError, setRegisterError] = useState('');


    useEffect(() => {
        // We assume the user is 'Alfan' for this demo
        const existingPasskey = getPasskeyForUser('Alfan');
        setPasskeyStatus(existingPasskey ? 'registered' : 'none');
    }, []);

    const handleRegisterPasskey = async () => {
        setIsRegistering(true);
        setRegisterError('');
        try {
            await createPasskey('Alfan');
            setPasskeyStatus('registered');
        } catch (err: any) {
            setRegisterError(err.message || 'Failed to register passkey.');
        } finally {
            setIsRegistering(false);
        }
    };


    // Mock settings state
    const [notifications, setNotifications] = useState(true);

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                    Manage your application preferences and security settings.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Account</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Alfan Adeefa</p>
                        <p className="text-sm text-gray-500">alfan.adeefa@example.com</p>
                    </div>
                    <Button variant="secondary" size="sm" disabled>Edit Profile</Button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Security</h2>
                 <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Vault Passphrase</p>
                        <p className="text-sm text-gray-500">
                            {isUnlocked ? 'Your vault is currently unlocked.' : 'Change the master passphrase for your encrypted vault.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isUnlocked && <Button onClick={lockVault} variant="secondary" size="sm">Lock Vault</Button>}
                        <Button onClick={() => setChangePassphraseOpen(true)} disabled={!isUnlocked}>
                           Change Passphrase
                        </Button>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="font-medium">Passkey Authentication</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Use biometrics to securely log in without a password.
                    </p>
                    {passkeyStatus === 'unknown' && <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-48"></div>}
                    {passkeyStatus === 'none' && (
                        <div>
                            <Button variant="secondary" onClick={handleRegisterPasskey} disabled={isRegistering}>
                                {isRegistering ? (
                                    <>
                                        <span className="mr-2">{ICONS.spinner}</span>
                                        Registering...
                                    </>
                                ) : 'Register a Passkey'}
                            </Button>
                            {registerError && <p className="text-sm text-red-500 mt-2">{registerError}</p>}
                        </div>
                    )}
                    {passkeyStatus === 'registered' && (
                        <div className="flex items-center text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 p-3 rounded-md text-sm font-medium">
                           <span className="mr-2">{ICONS.check}</span>
                           <span>Passkey is registered for this device.</span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Preferences</h2>
                 <div className="flex items-center justify-between">
                     <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">
                           Receive updates and summaries via email.
                        </p>
                    </div>
                    <button 
                        onClick={() => setNotifications(!notifications)}
                        className={`${notifications ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
                    >
                        <span className={`${notifications ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
                    </button>
                </div>
            </div>

            <ChangePassphraseModal
                isOpen={isChangePassphraseOpen}
                onClose={() => setChangePassphraseOpen(false)}
            />
        </div>
    );
};