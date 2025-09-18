
import React, { useState, useEffect } from 'react';
import { useVault } from '../hooks/useVault';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ICONS } from '../constants';

interface ChangePassphraseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePassphraseModal: React.FC<ChangePassphraseModalProps> = ({ isOpen, onClose }) => {
    const { changePassphrase, isLoading, error } = useVault();
    const [oldPassphrase, setOldPassphrase] = useState('');
    const [newPassphrase, setNewPassphrase] = useState('');
    const [confirmPassphrase, setConfirmPassphrase] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    // Clear form state when modal is closed/opened
    useEffect(() => {
        if (isOpen) {
            setOldPassphrase('');
            setNewPassphrase('');
            setConfirmPassphrase('');
            setLocalError(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (newPassphrase !== confirmPassphrase) {
            setLocalError("New passphrases do not match.");
            return;
        }
        if (!oldPassphrase || !newPassphrase) {
            setLocalError("All fields are required.");
            return;
        }

        const success = await changePassphrase(oldPassphrase, newPassphrase);
        if (success) {
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Change Vault Passphrase">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    To change your master passphrase, you must first provide your current one.
                </p>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Passphrase
                    </label>
                    <Input
                        type="password"
                        value={oldPassphrase}
                        onChange={(e) => setOldPassphrase(e.target.value)}
                        required
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Passphrase
                    </label>
                    <Input
                        type="password"
                        value={newPassphrase}
                        onChange={(e) => setNewPassphrase(e.target.value)}
                        required
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm New Passphrase
                    </label>
                    <Input
                        type="password"
                        value={confirmPassphrase}
                        onChange={(e) => setConfirmPassphrase(e.target.value)}
                        required
                    />
                </div>
                
                {(error || localError) && <p className="text-sm text-red-500">{error || localError}</p>}

                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <span className="mr-2">{ICONS.spinner}</span>}
                        {isLoading ? 'Changing...' : 'Change Passphrase'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
