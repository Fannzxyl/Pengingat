import React, { useState, useEffect } from 'react';
import { useVault } from '../../hooks/useVault';
import { VaultUnlockModal } from '../VaultUnlockModal';
import { AddVaultItemForm } from '../AddVaultItemForm';
import { VaultItemCard } from '../VaultItem';
import { Button } from '../ui/Button';
import { ICONS } from '../../constants';

export const VaultView: React.FC = () => {
    const { isUnlocked, decryptedItems, lockVault } = useVault();
    const [isUnlockModalOpen, setUnlockModalOpen] = useState(!isUnlocked);
    const [isAddItemModalOpen, setAddItemModalOpen] = useState(false);
    
    useEffect(() => {
        // If the vault becomes unlocked (e.g., through the modal), close the modal.
        if (isUnlocked && isUnlockModalOpen) {
            setUnlockModalOpen(false);
        }
        // If the vault becomes locked (e.g. from settings page), show the unlock modal prompt.
        if (!isUnlocked && !isUnlockModalOpen) {
            // This is handled by the main render block, which shows the locked view.
            // We could auto-open the modal with: setUnlockModalOpen(true); but manual click is better UX.
        }
    }, [isUnlocked, isUnlockModalOpen]);
    
    if (!isUnlocked) {
        return (
            <>
                <div className="text-center bg-white dark:bg-gray-800/50 p-12 rounded-lg shadow-sm">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        {ICONS.lock}
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Vault is Locked</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Your sensitive information is encrypted and secure.
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => setUnlockModalOpen(true)}>
                            Unlock Vault
                        </Button>
                    </div>
                </div>
                <VaultUnlockModal 
                    isOpen={isUnlockModalOpen} 
                    onClose={() => setUnlockModalOpen(false)} 
                />
            </>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Zero-Knowledge Vault</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Your sensitive data, encrypted and accessible only by you.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={lockVault}>Lock Vault</Button>
                    <Button onClick={() => setAddItemModalOpen(true)}>Add New Item</Button>
                </div>
            </div>

            {decryptedItems.length > 0 ? (
                <div className="space-y-4">
                    {decryptedItems.map(item => (
                        <VaultItemCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800/50 rounded-lg">
                    <h3 className="text-lg font-medium">Your Vault is Empty</h3>
                    <p className="mt-1 text-sm text-gray-500">Click 'Add New Item' to secure your first piece of data.</p>
                </div>
            )}
            
            <AddVaultItemForm 
                isOpen={isAddItemModalOpen} 
                onClose={() => setAddItemModalOpen(false)} 
            />
        </div>
    );
};
