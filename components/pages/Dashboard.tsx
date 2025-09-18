import React from 'react';
import { AiChatPanel } from '../AiChatPanel';
import { NoteCard } from '../NoteCard';
import type { Note } from '../../types';

// Mock data for recent notes
const mockRecentNotes: Note[] = [
    {
        id: 'n1', userId: 'u1', type: 'image', title: 'Design Inspiration', file_url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070&auto=format&fit=crop', tags: ['design', 'ui', 'inspiration'], createdAt: new Date(2024, 5, 20), updatedAt: new Date(),
    },
    {
        id: 'n2', userId: 'u1', type: 'text', title: 'Meeting Summary', content_text: 'Discussed Q3 roadmap and new feature prioritization. Key takeaways include focusing on user feedback for the next iteration and allocating more resources to the mobile app development.', tags: ['work', 'meeting', 'q3'], createdAt: new Date(2024, 5, 18), updatedAt: new Date(),
    },
    {
        id: 'n3', userId: 'u1', type: 'code', title: 'React Snippet', content_text: 'const useCustomHook = () => { ... };', tags: ['react', 'code', 'hooks'], createdAt: new Date(2024, 5, 15), updatedAt: new Date(),
    },
];

export const Dashboard: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, Alfan!</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                    Here's a look at your recent activity.
                </p>
                
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Recent Notes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {mockRecentNotes.map(note => (
                            <NoteCard key={note.id} note={note} onSelect={() => alert(`Note selected: ${note.title}`)} />
                        ))}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-1">
                 <AiChatPanel />
            </div>
        </div>
    );
};
