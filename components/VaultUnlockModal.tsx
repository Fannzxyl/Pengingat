
import React, { useState } from 'react';
import { useVault } from '../hooks/useVault';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ICONS } from '../constants';

interface VaultUnlockModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const VaultUnlockModal: React.FC<VaultUnlockModalProps> = ({ isOpen, onClose }) => {
    const { unlockVault, isLoading, error } = useVault();
    const [passphrase, setPassphrase] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passphrase) return;
        await unlockVault(passphrase);
        // If unlock is successful, the parent component should close the modal
        // based on the `isUnlocked` state from the hook.
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Unlock Your Vault">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter your master passphrase to decrypt and access your sensitive data. This passphrase is never sent to our servers.
                </p>
                <div>
                    <label htmlFor="passphrase" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Master Passphrase
                    </label>
                    <Input
                        id="passphrase"
                        type="password"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="••••••••••••"
                        autoFocus
                    />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading || !passphrase}>
                        {isLoading && <span className="mr-2">{ICONS.spinner}</span>}
                        {isLoading ? 'Unlocking...' : 'Unlock'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
