import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { FileUpload } from './ui/FileUpload';
import { NoteType } from '../types';

interface QuickAddModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const noteTypes: NoteType[] = ['text', 'code', 'image', 'audio', 'video', 'file'];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
    const [selectedType, setSelectedType] = useState<NoteType>('text');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [tags, setTags] = useState('');

    const isFileType = ['image', 'audio', 'video', 'file'].includes(selectedType);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would handle the form submission,
        // potentially uploading the file and creating a new note.
        alert(`Adding new ${selectedType} note titled "${title}"`);
        handleClose();
    };

    const handleClose = () => {
        // Reset state
        setSelectedType('text');
        setTitle('');
        setContent('');
        setFile(null);
        setTags('');
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
                    <Input id="quickadd-title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter a title for your note" required autoFocus />
                </div>

                {isFileType ? (
                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File</label>
                        <FileUpload onFileUpload={setFile} />
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
                    <Input id="quickadd-tags" type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., work, important, idea" />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Add Note</Button>
                </div>
            </form>
        </Modal>
    );
};
