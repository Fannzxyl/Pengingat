export type NoteType = 'text' | 'image' | 'audio' | 'video' | 'file' | 'code';

export interface Note {
    id: string;
    userId: string;
    title: string;
    type: NoteType;
    content_text?: string;
    file_url?: string;
    mime?: string;
    size?: number;
    tags: string[];
    collectionId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Collection {
    id: string;
    userId: string;
    name: string;
    createdAt: Date;
}

export interface VaultItem {
    id: string;
    userId: string;
    title: string;
    ciphertext_base64: string;
    nonce: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DecryptedVaultItem {
    id: string;
    title: string;
    content: string;
}

export interface PasskeyCredential {
    id: string;
    publicKey: string;
    userHandle: string;
}

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
    role: ChatRole;
    content: string;
    timestamp: Date;
}
