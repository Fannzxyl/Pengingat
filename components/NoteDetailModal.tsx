// FIX: Implemented the NoteDetailModal component to display note details. The previous file content was invalid, causing build errors.
import React from 'react';
import { Modal } from './ui/Modal';
import { Note, Collection } from '../types';
import { formatDate } from '../utils/helpers';
import { ICONS } from '../constants';

interface NoteDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: Note | null;
    collections: Collection[];
    onUpdateNote: (note: Note) => void;
}

const renderNoteContent = (note: Note) => {
    switch (note.type) {
        case 'image':
            return note.file_url ? (
                <div className="relative group bg-gray-100 dark:bg-gray-900 flex justify-center items-center rounded-lg">
                    <img src={note.file_url} alt={note.title} className="rounded-lg max-h-96 w-auto object-contain" />
                    <a
                        href={note.file_url}
                        download
                        title="Download Image"
                        className="absolute top-3 right-3 p-2 bg-gray-800 bg-opacity-60 text-white rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-300"
                    >
                        {ICONS.download}
                    </a>
                </div>
            ) : <p>Image not available.</p>;
        case 'audio':
            return note.file_url ? <audio controls src={note.file_url} className="w-full">Your browser does not support the audio element.</audio> : <p>Audio not available.</p>;
        case 'video':
            return note.file_url ? <video controls src={note.file_url} className="rounded-lg max-h-96 w-full">Your browser does not support the video element.</video> : <p>Video not available.</p>;
        case 'code':
            return <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-sm overflow-x-auto"><code>{note.content_text}</code></pre>;
        case 'text':
            return <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content_text}</p>;
        case 'file':
            return note.file_url ? 
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-900 rounded-md">
                    <p className="font-semibold">File ready for download</p>
                    <p className="text-sm text-gray-500 mb-2">{note.mime} ({note.size ? `${(note.size / 1024).toFixed(2)} KB` : ''})</p>
                    <a href={note.file_url} download className="text-indigo-600 hover:underline font-medium">
                        Download Now
                    </a>
                </div>
                : <p>File not available.</p>
        default:
            return <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content_text || 'No content available.'}</p>;
    }
};

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({ isOpen, onClose, note, collections, onUpdateNote }) => {
    if (!note) {
        return null;
    }
    
    const handleCollectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCollectionId = e.target.value === 'none' ? undefined : e.target.value;
        onUpdateNote({ ...note, collectionId: newCollectionId });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={note.title}>
            <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span>{note.type.charAt(0).toUpperCase() + note.type.slice(1)} Note</span>
                    <span>Created: {formatDate(note.createdAt)}</span>
                </div>

                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    {renderNoteContent(note)}
                </div>

                 <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
                    {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {note.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full text-xs font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <label htmlFor="collection-select" className="text-xs text-gray-500">Collection:</label>
                        <select
                            id="collection-select"
                            value={note.collectionId || 'none'}
                            onChange={handleCollectionChange}
                            className="text-sm rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 py-1 pl-2 pr-8"
                        >
                            <option value="none">Uncategorized</option>
                            {collections.map(collection => (
                                <option key={collection.id} value={collection.id}>{collection.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </Modal>
    );
};