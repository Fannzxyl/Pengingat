// FIX: Removed invalid file header that was causing parsing errors.
import type { PasskeyCredential } from '../types';

// Helper functions for Base64URL encoding/decoding
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function base64UrlToArrayBuffer(base64Url: string): ArrayBuffer {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}


/**
 * Initiates the passkey registration process.
 * This simulates the flow that would normally involve a server.
 * @param username - The username for which to create the passkey.
 */
export async function createPasskey(username: string): Promise<void> {
    const userHandle = new TextEncoder().encode(username);

    // 1. Simulate getting a challenge from the server
    const challenge = window.crypto.getRandomValues(new Uint8Array(32));

    // 2. Define the public key credential creation options
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
            name: "Aura Personal Memory Vault",
            // The id should be the domain of your website
            id: window.location.hostname,
        },
        user: {
            id: userHandle,
            name: username,
            displayName: username,
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
        authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'required',
        },
        timeout: 60000,
        attestation: 'direct',
    };

    // 3. Call the WebAuthn API to create the credential
    const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
    }) as PublicKeyCredential;
    
    if (!credential) {
        throw new Error("Passkey creation was cancelled or failed.");
    }

    // FIX: Cast response to AuthenticatorAttestationResponse to access getPublicKey
    const attestationResponse = credential.response as AuthenticatorAttestationResponse;

    // 4. "Send" the credential to the "server" for storage (using localStorage)
    const newPasskey: PasskeyCredential = {
        id: arrayBufferToBase64Url(credential.rawId),
        publicKey: arrayBufferToBase64Url(attestationResponse.getPublicKey()!),
        // FIX: The `getUserHandle` method does not exist on `AuthenticatorAttestationResponse`.
        // The correct user handle is the one passed in `publicKeyCredentialCreationOptions.user.id`.
        userHandle: arrayBufferToBase64Url(userHandle.buffer),
    };

    localStorage.setItem(`passkey_${username}`, JSON.stringify(newPasskey));
}

/**
 * Checks if a passkey is already registered for a given user.
 * @param username - The username to check.
 * @returns The stored passkey credential or null if not found.
 */
export function getPasskeyForUser(username: string): PasskeyCredential | null {
    const passkeyJSON = localStorage.getItem(`passkey_${username}`);
    if (passkeyJSON) {
        try {
            return JSON.parse(passkeyJSON) as PasskeyCredential;
        } catch (e) {
            console.error("Failed to parse stored passkey:", e);
            return null;
        }
    }
    return null;
}


/**
 * Initiates the passkey login (authentication) process.
 * @param username The user attempting to log in.
 * @returns A promise that resolves to true on successful authentication.
 */
export async function startPasskeyLogin(username: string): Promise<boolean> {
    const storedPasskey = getPasskeyForUser(username);
    if (!storedPasskey) {
        throw new Error("No passkey has been registered for this user.");
    }

    // 1. Simulate getting a challenge from the server
    const challenge = window.crypto.getRandomValues(new Uint8Array(32));

    // 2. Define the public key credential request options
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [{
            id: base64UrlToArrayBuffer(storedPasskey.id),
            type: 'public-key',
            transports: ['internal'], // For platform authenticators like Face ID / Windows Hello
        }],
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname,
    };

    try {
        // 3. Call the WebAuthn API to get an assertion
        const assertion = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions
        });

        if (!assertion) {
            return false; // User cancelled or the process failed.
        }

        // 4. In a real application, the `assertion` object would be sent to the server for verification.
        // For this simulation, a successful `get()` is sufficient to grant access.
        console.log("Passkey assertion successful:", assertion);
        return true;

    } catch (err) {
        console.error("Passkey login failed:", err);
        // Re-throw specific, user-friendly errors
        if (err instanceof Error) {
            if (err.name === 'NotAllowedError') {
                throw new Error("Authentication was cancelled.");
            }
        }
        throw new Error("An unknown error occurred during passkey login.");
    }
}