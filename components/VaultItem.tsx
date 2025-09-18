import React, { useState } from 'react';
import { DecryptedVaultItem } from '../types';
import { ICONS } from '../constants';
import { Button } from './ui/Button';

interface VaultItemCardProps {
    item: DecryptedVaultItem;
}

export const VaultItemCard: React.FC<VaultItemCardProps> = ({ item }) => {
    const [isContentVisible, setIsContentVisible] = useState(false);

    const toggleVisibility = () => {
        setIsContentVisible(prev => !prev);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(item.content);
        // In a real app, show a toast notification
        alert("Content copied to clipboard!");
    };
    
    return (
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow-sm flex items-center justify-between">
            <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{item.title}</h3>
                {isContentVisible ? (
                    <p className="font-mono text-gray-600 dark:text-gray-300 mt-1 bg-gray-100 dark:bg-gray-900 p-2 rounded-md">
                        {item.content}
                    </p>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        ••••••••••••••••
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={toggleVisibility} title={isContentVisible ? 'Hide' : 'Show'}>
                    {isContentVisible ? ICONS.eyeOff : ICONS.eye}
                </Button>
                {isContentVisible && (
                    <Button variant="secondary" size="sm" onClick={copyToClipboard} title="Copy to clipboard">
                        Copy
                    </Button>
                )}
            </div>
        </div>
    );
};
