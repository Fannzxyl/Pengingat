import React, { useState, useMemo, useEffect } from 'react';
import type { Note, NoteType, Collection } from '../../types';
import { NoteCard } from '../NoteCard';
import { NoteDetailModal } from '../NoteDetailModal';
import { NoteCardSkeleton } from '../skeletons/NoteCardSkeleton';
import { NotesFilter } from '../NotesFilter';
import { CreateCollectionModal } from '../CreateCollectionModal';
import { Button } from '../ui/Button';
import { ICONS } from '../../constants';
import {
    loadNotesFromStorage,
    saveNotesToStorage,
    loadCollectionsFromStorage,
    saveCollectionsToStorage,
    getDefaultNotes,
    getDefaultCollections,
    NOTES_UPDATED_EVENT,
    COLLECTIONS_UPDATED_EVENT,
} from '../../services/noteStorage';

interface NotesViewProps {
    searchQuery: string;
}

function areNotesEqual(current: Note[], incoming: Note[]): boolean {
    if (current.length !== incoming.length) {
        return false;
    }

    return current.every((note, index) => {
        const next = incoming[index];
        if (!next) {
            return false;
        }

        const noteTags = note.tags ?? [];
        const nextTags = next.tags ?? [];
        const tagsMatch = noteTags.length === nextTags.length && noteTags.every((tag, tagIndex) => tag === nextTags[tagIndex]);

        return (
            note.id === next.id &&
            note.title === next.title &&
            note.type === next.type &&
            (note.collectionId ?? '') === (next.collectionId ?? '') &&
            note.updatedAt.getTime() === next.updatedAt.getTime() &&
            tagsMatch
        );
    });
}

function areCollectionsEqual(current: Collection[], incoming: Collection[]): boolean {
    if (current.length !== incoming.length) {
        return false;
    }

    return current.every((collection, index) => {
        const next = incoming[index];
        if (!next) {
            return false;
        }

        return (
            collection.id === next.id &&
            collection.name === next.name &&
            collection.userId === next.userId &&
            collection.createdAt.getTime() === next.createdAt.getTime()
        );
    });
}

export const NotesView: React.FC<NotesViewProps> = ({ searchQuery }) => {
    const [notes, setNotes] = useState<Note[]>(() => {
        const stored = loadNotesFromStorage();
        return stored.length > 0 ? stored : getDefaultNotes();
    });
    const [collections, setCollections] = useState<Collection[]>(() => {
        const stored = loadCollectionsFromStorage();
        return stored.length > 0 ? stored : getDefaultCollections();
    });
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isCreateCollectionOpen, setCreateCollectionOpen] = useState(false);

    useEffect(() => {
        saveNotesToStorage(notes);
    }, [notes]);

    useEffect(() => {
        saveCollectionsToStorage(collections);
    }, [collections]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const syncNotes = () => {
            const latest = loadNotesFromStorage();
            setNotes(prev => (areNotesEqual(prev, latest) ? prev : latest));
        };
        window.addEventListener(NOTES_UPDATED_EVENT, syncNotes);
        return () => {
            window.removeEventListener(NOTES_UPDATED_EVENT, syncNotes);
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const syncCollections = () => {
            const latest = loadCollectionsFromStorage();
            setCollections(prev => (areCollectionsEqual(prev, latest) ? prev : latest));
        };
        window.addEventListener(COLLECTIONS_UPDATED_EVENT, syncCollections);
        return () => {
            window.removeEventListener(COLLECTIONS_UPDATED_EVENT, syncCollections);
        };
    }, []);

    const [filters, setFilters] = useState<{ type: NoteType | 'all'; tag: string }>({ type: 'all', tag: '' });

    const uniqueTags = useMemo(() => {
        const allTags = notes.flatMap(note => note.tags ?? []);
        return [...new Set(allTags)];
    }, [notes]);

    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            const typeMatch = filters.type === 'all' || note.type === filters.type;
            const noteTags = note.tags ?? [];
            const tagMatch = filters.tag === '' || noteTags.includes(filters.tag);

            if (!typeMatch || !tagMatch) {
                return false;
            }

            if (normalizedSearch === '') {
                return true;
            }

            const haystack = [
                note.title,
                note.content_text ?? '',
                noteTags.join(' '),
                note.type,
            ]
                .join(' ')
                .toLowerCase();

            return haystack.includes(normalizedSearch);
        });
    }, [notes, filters, normalizedSearch]);

    const handleSelectNote = (note: Note) => {
        setSelectedNote(note);
    };

    const handleUpdateNote = (updatedNote: Note) => {
        setNotes(prevNotes => prevNotes.map(n => (n.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date() } : n)));
    };

    const handleCreateCollection = (name: string) => {
        const newCollection: Collection = {
            id: `c${Date.now()}`,
            userId: 'u1',
            name,
            createdAt: new Date(),
        };
        setCollections(prev => [...prev, newCollection]);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notes</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        All your thoughts and ideas, organized in one place.
                    </p>
                </div>
                <Button onClick={() => setCreateCollectionOpen(true)}>
                    <span className="mr-2">{ICONS.add}</span>
                    New Collection
                </Button>
            </div>

            <NotesFilter onFilterChange={setFilters} uniqueTags={uniqueTags} />

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <NoteCardSkeleton key={index} />
                    ))}
                </div>
            ) : filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredNotes.map(note => (
                        <NoteCard key={note.id} note={note} onSelect={handleSelectNote} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 rounded-3xl border border-white/40 bg-white/70 shadow-lg shadow-indigo-500/10 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60">
                    <h3 className="text-lg font-medium">No Notes Found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or adding a new note.</p>
                </div>
            )}

            <NoteDetailModal
                isOpen={!!selectedNote}
                onClose={() => setSelectedNote(null)}
                note={selectedNote}
                collections={collections}
                onUpdateNote={handleUpdateNote}
            />

            <CreateCollectionModal
                isOpen={isCreateCollectionOpen}
                onClose={() => setCreateCollectionOpen(false)}
                onCreate={handleCreateCollection}
            />
        </div>
    );
};

