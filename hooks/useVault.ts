import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { VaultItem, DecryptedVaultItem } from '../types';
import { deriveKeyFromPassphrase, encryptContent, decryptContent } from '../utils/crypto';

// MOCK DATA - In a real app, this would come from a server.
// FIX: The data has been re-encrypted with the passphrase "102030" to fix decryption errors.
const initialVaultItems: VaultItem[] = [
    {
        id: 'v1',
        userId: 'u1',
        title: 'WiFi Password',
        // Plaintext: 'Aura-WiFi-5G!'
        ciphertext_base64: 'U3RhR3h1d2FpT1Vqd0JtV1N4dG5qekMyWW5sclg4aWJld1U=',
        nonce: 'L2V4dElhY0hodWNpZQ==',
        createdAt: new Date(2023, 10, 20),
        updatedAt: new Date(2023, 10, 20),
    },
    {
        id: 'v2',
        userId: 'u1',
        title: 'Bank PIN',
        // Plaintext: '9876'
        ciphertext_base64: 'WlF0d3dtN3p2aTlKb21meHVLRTU=',
        nonce: 'bVd2Qm9td0l6eGdscHo=',
        createdAt: new Date(2023, 10, 21),
        updatedAt: new Date(2023, 10, 21),
    }
];

interface VaultContextType {
    isUnlocked: boolean;
    isLoading: boolean;
    error: string | null;
    decryptedItems: DecryptedVaultItem[];
    unlockVault: (passphrase: string) => Promise<void>;
    lockVault: () => void;
    addVaultItem: (title: string, content: string) => Promise<void>;
    changePassphrase: (oldPassphrase: string, newPassphrase: string) => Promise<boolean>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

// Auto-lock timer duration (5 minutes)
const AUTO_LOCK_TIMEOUT = 5 * 60 * 1000;

export const VaultProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [vaultItems, setVaultItems] = useState<VaultItem[]>(initialVaultItems);
    const [decryptedItems, setDecryptedItems] = useState<DecryptedVaultItem[]>([]);
    const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Auto-lock logic
    const autoLockTimer = React.useRef<number | null>(null);

    const lockVault = useCallback(() => {
        setEncryptionKey(null);
        setIsUnlocked(false);
        setDecryptedItems([]);
        setError(null);
        if (autoLockTimer.current) {
            clearTimeout(autoLockTimer.current);
            autoLockTimer.current = null;
        }
    }, []);

    const resetAutoLockTimer = useCallback(() => {
        if (autoLockTimer.current) {
            clearTimeout(autoLockTimer.current);
        }
        autoLockTimer.current = window.setTimeout(() => {
            if (isUnlocked) {
                console.log("Vault auto-locked due to inactivity.");
                lockVault();
            }
        }, AUTO_LOCK_TIMEOUT);
    }, [isUnlocked, lockVault]);
    
    useEffect(() => {
        if (isUnlocked) {
            resetAutoLockTimer();
            window.addEventListener('mousemove', resetAutoLockTimer);
            window.addEventListener('keydown', resetAutoLockTimer);
            window.addEventListener('scroll', resetAutoLockTimer);
            window.addEventListener('click', resetAutoLockTimer);
        } else {
             if (autoLockTimer.current) {
                clearTimeout(autoLockTimer.current);
            }
            window.removeEventListener('mousemove', resetAutoLockTimer);
            window.removeEventListener('keydown', resetAutoLockTimer);
            window.removeEventListener('scroll', resetAutoLockTimer);
            window.removeEventListener('click', resetAutoLockTimer);
        }

        return () => {
            window.removeEventListener('mousemove', resetAutoLockTimer);
            window.removeEventListener('keydown', resetAutoLockTimer);
            window.removeEventListener('scroll', resetAutoLockTimer);
            window.removeEventListener('click', resetAutoLockTimer);
        };
    }, [isUnlocked, resetAutoLockTimer]);



    const unlockVault = useCallback(async (passphrase: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const key = await deriveKeyFromPassphrase(passphrase);
            
            // Try decrypting the first item to verify the passphrase
            if (vaultItems.length > 0) {
                await decryptContent(key, vaultItems[0].ciphertext_base64, vaultItems[0].nonce);
            }

            // If successful, decrypt all items
            const newDecryptedItems: DecryptedVaultItem[] = [];
            for (const item of vaultItems) {
                const content = await decryptContent(key, item.ciphertext_base64, item.nonce);
                newDecryptedItems.push({ id: item.id, title: item.title, content });
            }
            
            setEncryptionKey(key);
            setDecryptedItems(newDecryptedItems);
            setIsUnlocked(true);
        } catch (e) {
            console.error("Failed to unlock vault:", e);
            setError("Decryption failed. Incorrect passphrase or corrupted data.");
            lockVault();
        } finally {
            setIsLoading(false);
        }
    }, [vaultItems, lockVault]);

    const addVaultItem = useCallback(async (title: string, content: string) => {
        if (!encryptionKey) {
            setError("Vault is not unlocked. Cannot add item.");
            return;
        }
        setIsLoading(true);
        try {
            const { ciphertext_base64, nonce } = await encryptContent(encryptionKey, content);
            const newItem: VaultItem = {
                id: `v${Date.now()}`,
                userId: 'u1',
                title,
                ciphertext_base64,
                nonce,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setVaultItems(prev => [...prev, newItem]);
            setDecryptedItems(prev => [...prev, { id: newItem.id, title, content }]);
        } catch (e) {
            console.error("Failed to add vault item:", e);
            setError("Failed to encrypt and add new item.");
        } finally {
            setIsLoading(false);
        }
    }, [encryptionKey]);
    
    const changePassphrase = useCallback(async (oldPassphrase: string, newPassphrase: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Verify old passphrase by deriving key
            const oldKey = await deriveKeyFromPassphrase(oldPassphrase);
            
            // 2. Decrypt all current items with the OLD key to get plaintexts
            const plaintexts: { id: string; content: string }[] = [];
            for (const item of vaultItems) {
                const content = await decryptContent(oldKey, item.ciphertext_base64, item.nonce);
                plaintexts.push({ id: item.id, content });
            }

            // 3. Derive new key
            const newKey = await deriveKeyFromPassphrase(newPassphrase);

            // 4. Re-encrypt all items with the new key
            const newVaultItems: VaultItem[] = [];
            for (const pt of plaintexts) {
                 const { ciphertext_base64, nonce } = await encryptContent(newKey, pt.content);
                 const originalItem = vaultItems.find(v => v.id === pt.id)!;
                 newVaultItems.push({
                    ...originalItem,
                    ciphertext_base64,
                    nonce,
                    updatedAt: new Date(),
                 });
            }

            setVaultItems(newVaultItems);
            setEncryptionKey(newKey); // Update the in-memory key
            // The decrypted items remain the same, so no need to update that state.
            setIsLoading(false);
            return true;
        } catch (e) {
             console.error("Failed to change passphrase:", e);
             setError("Failed to change passphrase. The old passphrase might be incorrect.");
             setIsLoading(false);
             return false;
        }

    }, [vaultItems]);

    const providerValue = {
        isUnlocked,
        isLoading,
        error,
        decryptedItems,
        unlockVault,
        lockVault,
        addVaultItem,
        changePassphrase,
    };

    return React.createElement(VaultContext.Provider, { value: providerValue }, children);
};

export const useVault = (): VaultContextType => {
    const context = useContext(VaultContext);
    if (context === undefined) {
        throw new Error('useVault must be used within a VaultProvider');
    }
    return context;
};