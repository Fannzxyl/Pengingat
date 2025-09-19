import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { VaultItem, DecryptedVaultItem } from '../types';
import { deriveKeyFromPassphrase, encryptContent, decryptContent } from '../utils/crypto';

// Storage key so vault items persist between sessions (encrypted payload only)
const VAULT_STORAGE_KEY = 'azura-vault-items';

// MOCK DATA - In a real app, this would come from a server.
// FIX: Data matches the demo passphrase \"102030\" and now acts as the initial seed if no saved state exists.
const initialVaultItems: VaultItem[] = [
    {
        id: 'v1',
        userId: 'u1',
        title: 'WiFi Password',
        // Plaintext: 'Azura-WiFi-5G!'
        ciphertext_base64: '2x0+TnIsWDvb/7REftVjShHnnm7CD6VxZTsAJ25m',
        nonce: 'M+QHcImYyNa8/MnT',
        createdAt: new Date(2023, 10, 20),
        updatedAt: new Date(2023, 10, 20),
    },
    {
        id: 'v2',
        userId: 'u1',
        title: 'Bank PIN',
        // Plaintext: '9876'
        ciphertext_base64: 'oxeN51DEF1qpJY4MZaonDJdAhl4=',
        nonce: 'l/Qv4jRRRhwIlt/j',
        createdAt: new Date(2023, 10, 21),
        updatedAt: new Date(2023, 10, 21),
    }
];

function reviveVaultItems(serialized: string | null): VaultItem[] {
    if (!serialized) {
        return initialVaultItems;
    }
    try {
        const parsed = JSON.parse(serialized) as Array<Omit<VaultItem, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }>;
        return parsed.map(item => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
        }));
    } catch (error) {
        console.error('Failed to parse stored vault items. Using defaults.', error);
        if (typeof window !== 'undefined') {
            window.localStorage?.removeItem(VAULT_STORAGE_KEY);
        }
        return initialVaultItems;
    }
}

function persistVaultItems(items: VaultItem[]): void {
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }
    const payload = items.map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
    }));
    window.localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(payload));
}

const LEGACY_SALT = 'aura-secure-memory-vault-salt';

async function decryptItemsWithKey(key: CryptoKey, items: VaultItem[]): Promise<DecryptedVaultItem[]> {
    const decrypted: DecryptedVaultItem[] = [];
    for (const item of items) {
        const content = await decryptContent(key, item.ciphertext_base64, item.nonce);
        decrypted.push({ id: item.id, title: item.title, content });
    }
    return decrypted;
}

function isCryptoOperationError(error: unknown): boolean {
    if (error instanceof DOMException) {
        return error.name === 'OperationError' || error.name === 'NotSupportedError';
    }
    if (error instanceof Error) {
        const message = error.message ?? '';
        return message.includes('OperationError') || message.includes('Decryption failed');
    }
    return false;
}

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
    const [vaultItems, setVaultItems] = useState<VaultItem[]>(() => {
        if (typeof window === 'undefined' || !window.localStorage) {
            return initialVaultItems;
        }
        const stored = window.localStorage.getItem(VAULT_STORAGE_KEY);
        return reviveVaultItems(stored);
    });
    const [decryptedItems, setDecryptedItems] = useState<DecryptedVaultItem[]>([]);
    const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        persistVaultItems(vaultItems);
    }, [vaultItems]);

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
                console.log('Vault auto-locked due to inactivity.');
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
            const currentKey = await deriveKeyFromPassphrase(passphrase);
            let decrypted: DecryptedVaultItem[] = [];

            try {
                decrypted = await decryptItemsWithKey(currentKey, vaultItems);
            } catch (error) {
                if (isCryptoOperationError(error)) {
                    try {
                        const legacyKey = await deriveKeyFromPassphrase(passphrase, { salt: LEGACY_SALT });
                        const legacyDecrypted = await decryptItemsWithKey(legacyKey, vaultItems);

                        const migratedItems: VaultItem[] = await Promise.all(
                            vaultItems.map(async (original) => {
                                const match = legacyDecrypted.find(item => item.id === original.id);
                                if (!match) {
                                    return original;
                                }
                                const { ciphertext_base64, nonce } = await encryptContent(currentKey, match.content);
                                return {
                                    ...original,
                                    ciphertext_base64,
                                    nonce,
                                    updatedAt: new Date(),
                                };
                            })
                        );

                        setVaultItems(migratedItems);
                        decrypted = legacyDecrypted;
                    } catch {
                        throw error;
                    }
                } else {
                    throw error;
                }
            }

            setEncryptionKey(currentKey);
            setDecryptedItems(decrypted);
            setIsUnlocked(true);
        } catch (e) {
            console.error('Failed to unlock vault:', e);
            setError('Decryption failed. Incorrect passphrase or corrupted data.');
            lockVault();
        } finally {
            setIsLoading(false);
        }
    }, [vaultItems, lockVault]);

    const addVaultItem = useCallback(async (title: string, content: string) => {
        if (!encryptionKey) {
            setError('Vault is not unlocked. Cannot add item.');
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
            console.error('Failed to add vault item:', e);
            setError('Failed to encrypt and add new item.');
        } finally {
            setIsLoading(false);
        }
    }, [encryptionKey]);

    const changePassphrase = useCallback(async (oldPassphrase: string, newPassphrase: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const oldKey = await deriveKeyFromPassphrase(oldPassphrase);

            const plaintexts: { id: string; content: string }[] = [];
            for (const item of vaultItems) {
                const content = await decryptContent(oldKey, item.ciphertext_base64, item.nonce);
                plaintexts.push({ id: item.id, content });
            }

            const newKey = await deriveKeyFromPassphrase(newPassphrase);

            const newVaultItems: VaultItem[] = [];
            for (const pt of plaintexts) {
                const { ciphertext_base64, nonce } = await encryptContent(newKey, pt.content);
                const originalItem = vaultItems.find(v => v.id === pt.id);
                if (!originalItem) {
                    continue;
                }
                newVaultItems.push({
                    ...originalItem,
                    ciphertext_base64,
                    nonce,
                    updatedAt: new Date(),
                });
            }

            setVaultItems(newVaultItems);
            setEncryptionKey(newKey);
            setIsLoading(false);
            return true;
        } catch (e) {
            console.error('Failed to change passphrase:', e);
            setError('Failed to change passphrase. The old passphrase might be incorrect.');
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



