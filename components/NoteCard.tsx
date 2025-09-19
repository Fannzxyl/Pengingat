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
    return <span className="text-indigo-400 dark:text-indigo-300">{iconMap[type] || ICONS.file}</span>;
};

export const NoteCard: React.FC<NoteCardProps> = ({ note, onSelect }) => {
    const renderPreview = () => {
        switch (note.type) {
            case 'image':
                return note.file_url ? (
                    <img src={note.file_url} alt={note.title} className="w-full h-36 object-cover rounded-2xl border border-white/30 dark:border-slate-800/60" />
                ) : (
                    <div className="h-36 rounded-2xl border border-dashed border-white/40 bg-white/40 dark:border-slate-800/60 dark:bg-slate-900/40 flex items-center justify-center">
                        <NoteIcon type={note.type} />
                    </div>
                );
            case 'text':
                return (
                    <div className="h-36 rounded-2xl border border-white/30 bg-white/50 p-4 text-sm text-slate-600 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-300 overflow-hidden">
                        <p className="line-clamp-4">{note.content_text}</p>
                    </div>
                );
            default:
                return (
                    <div className="h-36 rounded-2xl border border-white/30 bg-white/40 dark:border-slate-800/60 dark:bg-slate-900/50 flex items-center justify-center">
                        <NoteIcon type={note.type} />
                    </div>
                );
        }
    };

    return (
        <button
            type="button"
            onClick={() => onSelect(note)}
            className="w-full text-left rounded-3xl border border-white/40 bg-white/70 p-4 shadow-xl shadow-indigo-500/10 transition hover:-translate-y-1 hover:shadow-indigo-500/20 dark:border-slate-800/60 dark:bg-slate-900/60"
        >
            <div className="space-y-3">
                {renderPreview()}
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">{note.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(note.createdAt)}</p>
                </div>
                {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {note.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-indigo-100/70 text-indigo-700 text-xs dark:bg-indigo-900/60 dark:text-indigo-200">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </button>
    );
};
