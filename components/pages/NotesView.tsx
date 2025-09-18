import React, { useState, useMemo } from 'react';
import type { Note, NoteType, Collection } from '../../types';
import { NoteCard } from '../NoteCard';
import { NoteDetailModal } from '../NoteDetailModal';
import { NoteCardSkeleton } from '../skeletons/NoteCardSkeleton';
import { NotesFilter } from '../NotesFilter';
import { CreateCollectionModal } from '../CreateCollectionModal';
import { Button } from '../ui/Button';
import { ICONS } from '../../constants';

// MOCK DATA for Notes
const MOCK_NOTES: Note[] = [
    { id: '1', userId: 'u1', type: 'text', title: 'Grocery List', content_text: 'Milk, Bread, Cheese, Apples', tags: ['shopping', 'home'], createdAt: new Date('2024-05-20'), updatedAt: new Date(), collectionId: 'c1' },
    { id: '2', userId: 'u1', type: 'image', title: 'Sunset Photo', file_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2532&auto=format&fit=crop', tags: ['photography', 'nature'], createdAt: new Date('2024-05-19'), updatedAt: new Date() },
    { id: '3', userId: 'u1', type: 'code', title: 'useState Snippet', content_text: "const [value, setValue] = useState('');", tags: ['react', 'javascript', 'code'], createdAt: new Date('2024-05-18'), updatedAt: new Date(), collectionId: 'c2' },
    { id: '4', userId: 'u1', type: 'audio', title: 'Meeting Recording', file_url: '/mock-audio.mp3', tags: ['work', 'meeting'], createdAt: new Date('2024-05-17'), updatedAt: new Date(), collectionId: 'c1' },
    { id: '5', userId: 'u1', type: 'video', title: 'Vacation Clip', file_url: '/mock-video.mp4', tags: ['travel', 'vacation'], createdAt: new Date('2024-05-16'), updatedAt: new Date() },
    { id: '6', userId: 'u1', type: 'file', title: 'Project Proposal', file_url: '/mock-document.pdf', mime: 'application/pdf', size: 120400, tags: ['work', 'project'], createdAt: new Date('2024-05-15'), updatedAt: new Date(), collectionId: 'c1' },
    { id: '7', userId: 'u1', type: 'text', title: 'Book Recommendations', content_text: '1. The Silent Patient\n2. Atomic Habits\n3. Project Hail Mary', tags: ['reading', 'books'], createdAt: new Date('2024-05-14'), updatedAt: new Date(), collectionId: 'c2' },
    { id: '8', userId: 'u1', type: 'image', title: 'Architecture Idea', file_url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop', tags: ['design', 'architecture'], createdAt: new Date('2024-05-12'), updatedAt: new Date() },
];

const MOCK_COLLECTIONS: Collection[] = [
    { id: 'c1', userId: 'u1', name: 'Work Projects', createdAt: new Date() },
    { id: 'c2', userId: 'u1', name: 'Personal', createdAt: new Date() },
];


export const NotesView: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
    const [collections, setCollections] = useState<Collection[]>(MOCK_COLLECTIONS);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isCreateCollectionOpen, setCreateCollectionOpen] = useState(false);
    
    const [filters, setFilters] = useState<{ type: NoteType | 'all', tag: string }>({ type: 'all', tag: '' });

    const uniqueTags = useMemo(() => {
        const allTags = notes.flatMap(note => note.tags);
        return [...new Set(allTags)];
    }, [notes]);

    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            const typeMatch = filters.type === 'all' || note.type === filters.type;
            const tagMatch = filters.tag === '' || note.tags.includes(filters.tag);
            return typeMatch && tagMatch;
        });
    }, [notes, filters]);

    const handleSelectNote = (note: Note) => {
        setSelectedNote(note);
    };
    
    const handleUpdateNote = (updatedNote: Note) => {
        setNotes(prevNotes => prevNotes.map(n => n.id === updatedNote.id ? updatedNote : n));
        // In a real app, also make an API call to save the change
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
                    {Array.from({ length: 8 }).map((_, index) => <NoteCardSkeleton key={index} />)}
                </div>
            ) : filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredNotes.map(note => (
                        <NoteCard key={note.id} note={note} onSelect={handleSelectNote} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800/50 rounded-lg">
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
