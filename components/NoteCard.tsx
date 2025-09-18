import React from 'react';
import type { Note } from '../types';
import { formatDate } from '../utils/helpers';
import { ICONS } from '../constants';

interface NoteCardProps {
    note: Note;
    onSelect: (note: Note) => void;
}

const NoteIcon: React.FC<{ type: Note['type'] }> = ({ type }) => {
    const iconMap = {
        text: ICONS.file,
        image: ICONS.image,
        audio: ICONS.audio,
        video: ICONS.video,
        file: ICONS.file,
        code: ICONS.code,
    };
    return <span className="text-gray-400">{iconMap[type] || ICONS.file}</span>;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onSelect }) => {
    const renderPreview = () => {
        switch(note.type) {
            case 'image':
                return note.file_url ? (
                    <img src={note.file_url} alt={note.title} className="w-full h-32 object-cover rounded-t-lg" />
                ) : <div className="h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-t-lg"><NoteIcon type={note.type} /></div>;
            case 'text':
                return <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 p-4">{note.content_text}</p>;
            default:
                return <div className="h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-t-lg"><NoteIcon type={note.type} /></div>;
        }
    };
    
    return (
        <div
            onClick={() => onSelect(note)}
            className="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col"
        >
            {renderPreview()}
            <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{note.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(note.createdAt)}</p>
                </div>
                {note.tags && note.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                        {note.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full text-xs font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
