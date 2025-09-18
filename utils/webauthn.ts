// This is a MOCK implementation of WebAuthn functionality using localStorage.
// In a real application, this would use the browser's WebAuthn API 
// and communicate with a server for challenges and verification.

import type { PasskeyCredential } from '../types';

const PASSKEY_STORAGE_PREFIX = 'passkey_';

/**
 * Simulates registering a new passkey for a user.
 * @param username The username to associate with the passkey.
 * @returns A promise that resolves when the passkey is created.
 */
export async function createPasskey(username: string): Promise<void> {
    // Simulate user interaction delay and potential failure
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real scenario, this would involve a server challenge and browser API calls.
    // navigator.credentials.create(...)

    // For this mock, we'll just generate a fake credential.
    const newCredential: PasskeyCredential = {
        id: `pk_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        publicKey: 'mockPublicKey', // This would be a real public key
        userHandle: username,
    };

    // Store it in localStorage
    localStorage.setItem(`${PASSKEY_STORAGE_PREFIX}${username}`, JSON.stringify(newCredential));
    console.log(`Mock passkey created for ${username}:`, newCredential);
}

/**
 * Retrieves a stored passkey for a user.
 * @param username The username to look up.
 * @returns The stored PasskeyCredential or null if not found.
 */
export function getPasskeyForUser(username: string): PasskeyCredential | null {
    const stored = localStorage.getItem(`${PASSKEY_STORAGE_PREFIX}${username}`);
    if (stored) {
        try {
            return JSON.parse(stored) as PasskeyCredential;
        } catch (e) {
            console.error("Failed to parse stored passkey", e);
            return null;
        }
    }
    return null;
}

/**
 * Simulates logging in with a passkey.
 * @param username The username of the user trying to log in.
 * @returns A promise that resolves to true if login is successful, false otherwise.
 */
export async function loginWithPasskey(username:string): Promise<boolean> {
     // Simulate user interaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real scenario, this would involve a server challenge and:
    // navigator.credentials.get(...)

    // For this mock, we just check if a passkey exists for the user.
    const passkey = getPasskeyForUser(username);
    
    if (passkey) {
        console.log(`Mock passkey login successful for ${username}`);
        return true;
    } else {
        console.log(`No passkey found for ${username}`);
        return false;
    }
}
