const STORAGE_KEY = 'azura-auth-user';
const DEFAULT_USER = { username: 'Alfan', password: 'Adeefa123' } as const;

const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

function getStorage(): Storage | null {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }
    return window.localStorage;
}

async function hashPassword(password: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto?.subtle && textEncoder) {
        const data = textEncoder.encode(password);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');
    }
    // Fallback: simple base64 encoding when crypto is unavailable (non-production environments)
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
        return window.btoa(password);
    }
    return password;
}

export interface StoredCredentials {
    username: string;
    passwordHash: string;
    updatedAt: string;
}

function persistCredentials(credentials: StoredCredentials): void {
    const storage = getStorage();
    if (!storage) {
        return;
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(credentials));
}

export async function ensureDefaultUser(): Promise<StoredCredentials | null> {
    const storage = getStorage();
    if (!storage) {
        return null;
    }
    const existing = storage.getItem(STORAGE_KEY);
    if (existing) {
        try {
            return JSON.parse(existing) as StoredCredentials;
        } catch (error) {
            storage.removeItem(STORAGE_KEY);
        }
    }
    const passwordHash = await hashPassword(DEFAULT_USER.password);
    const credentials: StoredCredentials = {
        username: DEFAULT_USER.username,
        passwordHash,
        updatedAt: new Date().toISOString(),
    };
    persistCredentials(credentials);
    return credentials;
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
    const storage = getStorage();
    if (!storage) {
        return false;
    }
    const stored = await ensureDefaultUser();
    if (!stored) {
        return false;
    }
    if (stored.username.trim().toLowerCase() !== username.trim().toLowerCase()) {
        return false;
    }
    const incomingHash = await hashPassword(password);
    return stored.passwordHash === incomingHash;
}

export async function updateCredentials(username: string, password: string): Promise<void> {
    const passwordHash = await hashPassword(password);
    persistCredentials({
        username,
        passwordHash,
        updatedAt: new Date().toISOString(),
    });
}

export function getStoredCredentials(): StoredCredentials | null {
    const storage = getStorage();
    if (!storage) {
        return null;
    }
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw) as StoredCredentials;
    } catch (error) {
        storage.removeItem(STORAGE_KEY);
        return null;
    }
}
