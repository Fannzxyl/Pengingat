import React, { useState, useEffect } from 'react';
import type { NoteType } from '../types';
import { Input } from './ui/Input';

interface NotesFilterProps {
    onFilterChange: (filters: { type: NoteType | 'all', tag: string }) => void;
    uniqueTags: string[];
}

const noteTypes: (NoteType | 'all')[] = ['all', 'text', 'code', 'image', 'audio', 'video', 'file'];

export const NotesFilter: React.FC<NotesFilterProps> = ({ onFilterChange, uniqueTags }) => {
    const [selectedType, setSelectedType] = useState<NoteType | 'all'>('all');
    const [selectedTag, setSelectedTag] = useState('');
    
    const [tagInputValue, setTagInputValue] = useState('');
    const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        onFilterChange({ type: selectedType, tag: selectedTag });
    }, [selectedType, selectedTag, onFilterChange]);

    const handleTypeChange = (type: NoteType | 'all') => {
        setSelectedType(type);
    };

    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTagInputValue(value);
        
        if (value.trim() === '') {
            setSelectedTag('');
            setTagSuggestions([]);
            setShowSuggestions(false);
        } else {
            const filtered = uniqueTags.filter(tag => tag.toLowerCase().includes(value.toLowerCase()));
            setTagSuggestions(filtered);
            setShowSuggestions(true);
        }
    };
    
    const handleSuggestionClick = (tag: string) => {
        setSelectedTag(tag);
        setTagInputValue(tag);
        setShowSuggestions(false);
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm">
            <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Filter by type:</label>
                <div className="flex flex-wrap gap-2">
                    {noteTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => handleTypeChange(type)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedType === type
                                ? 'bg-indigo-600 text-white font-semibold'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 md:max-w-xs">
                <label htmlFor="tag-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Filter by tag:</label>
                <div 
                    className="relative"
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                           setShowSuggestions(false);
                        }
                    }}
                >
                    <Input
                        id="tag-filter"
                        type="text"
                        placeholder="Type to search tags..."
                        value={tagInputValue}
                        onChange={handleTagInputChange}
                        onFocus={() => tagInputValue && setShowSuggestions(true)}
                        autoComplete="off"
                    />
                    {showSuggestions && tagSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                            {tagSuggestions.map(tag => (
                                <li
                                    key={tag}
                                    className="px-3 py-2 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                                    onMouseDown={() => handleSuggestionClick(tag)}
                                >
                                    {tag}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};