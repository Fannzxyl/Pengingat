import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { FileUpload } from './ui/FileUpload';
import { Note, NoteType } from '../types';
import { loadNotesFromStorage, saveNotesToStorage } from '../services/noteStorage';

interface QuickAddModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const noteTypes: NoteType[] = ['text', 'code', 'image', 'audio', 'video', 'file'];

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('File reader menghasilkan data yang tidak valid.'));
            }
        };
        reader.onerror = () => reject(reader.error ?? new Error('Gagal membaca file.'));
        reader.readAsDataURL(file);
    });
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
    const [selectedType, setSelectedType] = useState<NoteType>('text');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [tags, setTags] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const isFileType = ['image', 'audio', 'video', 'file'].includes(selectedType);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaving) {
            return;
        }

        setError(null);
        setIsSaving(true);

        try {
            let fileUrl: string | undefined;
            let mime: string | undefined;
            let size: number | undefined;

            if (isFileType) {
                if (!file) {
                    setError('Silakan pilih file untuk disimpan.');
                    setIsSaving(false);
                    return;
                }
                fileUrl = await fileToDataUrl(file);
                mime = file.type || undefined;
                size = file.size;
            } else if (!content.trim()) {
                setError('Isi catatan belum diisi.');
                setIsSaving(false);
                return;
            }

            const now = new Date();
            const normalizedTags = tags
                .split(',')
                .map(tag => tag.trim())
                .filter(Boolean);

            const newNote: Note = {
                id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                userId: 'u1',
                title: title.trim(),
                type: selectedType,
                tags: normalizedTags,
                createdAt: now,
                updatedAt: now,
            };

            if (selectedType === 'text' || selectedType === 'code') {
                newNote.content_text = content.trim();
            } else if (fileUrl) {
                newNote.file_url = fileUrl;
                newNote.mime = mime;
                newNote.size = size;
            }

            const existingNotes = loadNotesFromStorage();
            saveNotesToStorage([newNote, ...existingNotes]);

            handleClose();
        } catch (err) {
            console.error('Failed to add note via Quick Add:', err);
            setError('Gagal menambahkan catatan. Silakan coba lagi.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setSelectedType('text');
        setTitle('');
        setContent('');
        setFile(null);
        setTags('');
        setError(null);
        setIsSaving(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Quick Add New Note">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note Type</label>
                    <div className="flex flex-wrap gap-2">
                        {noteTypes.map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setSelectedType(type)}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedType === type
                                    ? 'bg-indigo-600 text-white font-semibold'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="quickadd-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <Input
                        id="quickadd-title"
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Enter a title for your note"
                        required
                        autoFocus
                    />
                </div>

                {isFileType ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File</label>
                        <FileUpload onFileUpload={uploaded => setFile(uploaded)} />
                    </div>
                ) : (
                    <div>
                        <label htmlFor="quickadd-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {selectedType === 'code' ? 'Code Snippet' : 'Content'}
                        </label>
                        <textarea
                            id="quickadd-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={selectedType === 'code' ? 'Paste your code here...' : 'Write your thoughts...'}
                            rows={selectedType === 'code' ? 8 : 4}
                            required
                            className="block w-full px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="quickadd-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
                    <Input
                        id="quickadd-tags"
                        type="text"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        placeholder="e.g., work, important, idea"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={handleClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Add Note'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
