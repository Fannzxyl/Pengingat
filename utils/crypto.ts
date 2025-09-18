
// This file handles all client-side encryption logic for the Zero-Knowledge Vault.

const SALT = "aura-secure-memory-vault-salt"; // In a real app, this might be user-specific and stored with their account
const ITERATIONS = 100000; // PBKDF2 iterations, higher is more secure but slower
const KEY_LENGTH = 256; // AES-256 key length
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const HASH_ALGORITHM = 'SHA-256';

// Helper to convert string to ArrayBuffer
function str2ab(str: string): ArrayBuffer {
  return new TextEncoder().encode(str);
}

// Helper to convert ArrayBuffer to string
function ab2str(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

// Helper to convert ArrayBuffer to Base64 string
function ab2b64(buf: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 string to ArrayBuffer
function b642ab(b64: string): ArrayBuffer {
  const binary_string = window.atob(b64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derives a cryptographic key from a user's passphrase using PBKDF2.
 * This key is kept in memory and NEVER sent to the server.
 * @param passphrase - The user's master passphrase for the vault.
 * @returns A promise that resolves to a CryptoKey.
 */
export async function deriveKeyFromPassphrase(passphrase: string): Promise<CryptoKey> {
  const passwordBuffer = str2ab(passphrase);
  const saltBuffer = str2ab(SALT);

  const masterKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    masterKey,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    true, // extractable = false in production for better security
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts plaintext content using AES-GCM with a derived key.
 * @param key - The CryptoKey derived from the user's passphrase.
 * @param plaintext - The string content to encrypt.
 * @returns A promise that resolves to an object containing the Base64 encoded ciphertext and nonce.
 */
export async function encryptContent(key: CryptoKey, plaintext: string): Promise<{ ciphertext_base64: string; nonce: string }> {
  const nonce = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit nonce for AES-GCM
  const plaintextBuffer = str2ab(plaintext);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: nonce,
    },
    key,
    plaintextBuffer
  );

  return {
    ciphertext_base64: ab2b64(ciphertextBuffer),
    nonce: ab2b64(nonce),
  };
}

/**
 * Decrypts ciphertext using AES-GCM with a derived key and nonce.
 * @param key - The CryptoKey derived from the user's passphrase.
 * @param ciphertext_base64 - The Base64 encoded ciphertext.
 * @param nonce_base64 - The Base64 encoded nonce.
 * @returns A promise that resolves to the decrypted plaintext string.
 */
export async function decryptContent(key: CryptoKey, ciphertext_base64: string, nonce_base64: string): Promise<string> {
  const ciphertextBuffer = b642ab(ciphertext_base64);
  const nonceBuffer = b642ab(nonce_base64);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: nonceBuffer,
      },
      key,
      ciphertextBuffer
    );
    return ab2str(decryptedBuffer);
  } catch (e) {
    console.error("Decryption failed. Incorrect passphrase or corrupted data.", e);
    throw new Error("Decryption failed. Incorrect passphrase or corrupted data.");
  }
}
