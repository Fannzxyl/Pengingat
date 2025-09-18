
import React, { useState } from 'react';
import { useVault } from '../hooks/useVault';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ICONS } from '../constants';

interface AddVaultItemFormProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddVaultItemForm: React.FC<AddVaultItemFormProps> = ({ isOpen, onClose }) => {
    const { addVaultItem, isLoading } = useVault();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        
        await addVaultItem(title, content);
        // Reset form and close modal on success
        setTitle('');
        setContent('');
        onClose();
    };

    const handleClose = () => {
        // Reset form state on close
        setTitle('');
        setContent('');
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Vault Item">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="vault-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title
                    </label>
                    <Input
                        id="vault-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., WiFi Password"
                        required
                        autoFocus
                    />
                </div>
                <div>
                    <label htmlFor="vault-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Content
                    </label>
                    <textarea
                        id="vault-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="The secret content you want to encrypt"
                        rows={4}
                        required
                        className="block w-full px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                     <Button type="button" variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading || !title.trim() || !content.trim()}>
                        {isLoading && <span className="mr-2">{ICONS.spinner}</span>}
                        {isLoading ? 'Adding...' : 'Add Item'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
