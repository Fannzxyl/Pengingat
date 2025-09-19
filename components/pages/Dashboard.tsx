import React, { useEffect, useMemo, useState } from 'react';
import { NoteCard } from '../NoteCard';
import type { Note } from '../../types';
import { ICONS } from '../../constants';
import {
    loadNotesFromStorage,
    NOTES_UPDATED_EVENT,
    getDefaultNotes,
} from '../../services/noteStorage';
import { formatDate } from '../../utils/helpers';

interface DashboardProps {
    searchQuery: string;
}

function loadAllNotes(): Note[] {
    const notes = loadNotesFromStorage();
    const source = notes.length > 0 ? notes : getDefaultNotes();
    return [...source].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export const Dashboard: React.FC<DashboardProps> = ({ searchQuery }) => {
    const [notes, setNotes] = useState<Note[]>(loadAllNotes);

    useEffect(() => {
        const refresh = () => setNotes(loadAllNotes());
        window.addEventListener(NOTES_UPDATED_EVENT, refresh);
        return () => {
            window.removeEventListener(NOTES_UPDATED_EVENT, refresh);
        };
    }, []);

    const recentNotes = useMemo(() => notes.slice(0, 3), [notes]);

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const hasSearch = normalizedQuery.length > 0;

    const searchResults = useMemo(() => {
        if (!hasSearch) {
            return [] as Note[];
        }

        return notes.filter(note => {
            const haystack = [
                note.title,
                note.content_text ?? '',
                note.tags?.join(' ') ?? '',
                note.type,
            ]
                .join(' ')
                .toLowerCase();

            return haystack.includes(normalizedQuery);
        });
    }, [notes, normalizedQuery, hasSearch]);

    const vaultStatus = 'Terkunci - Aman';

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, Alfan!</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Berikut ringkasan singkat aktivitas terakhir kamu di Azura.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg shadow-indigo-500/10 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white">
                            {ICONS.vault}
                        </span>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Vault Status</p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white">{vaultStatus}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg shadow-indigo-500/10 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/70 dark:text-indigo-300">
                            {ICONS.notes}
                        </span>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Catatan terbaru</p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                                {recentNotes.length} catatan terakhir
                            </p>
                        </div>
                    </div>
                </div>

                {hasSearch ? (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Hasil pencarian</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Menampilkan catatan yang cocok dengan “{searchQuery}”.
                            </p>
                        </div>
                        {searchResults.length > 0 ? (
                            <div className="space-y-3">
                                {searchResults.slice(0, 8).map(note => (
                                    <div
                                        key={note.id}
                                        className="rounded-3xl border border-white/40 bg-white/75 p-5 shadow-xl shadow-indigo-500/15 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {note.title}
                                            </h3>
                                            <span className="text-xs uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                                                {note.type}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Disimpan pada {formatDate(note.createdAt)}
                                        </p>
                                        {note.tags && note.tags.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {note.tags.slice(0, 5).map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {note.content_text && (
                                            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                                {note.content_text}
                                            </p>
                                        )}
                                    </div>
                                ))}
                                {searchResults.length > 8 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {`+${searchResults.length - 8} catatan lainnya cocok dengan pencarianmu.`}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-white/50 bg-white/60 p-8 text-center text-sm text-slate-500 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-300">
                                Belum ada catatan yang cocok. Coba ubah kata kunci atau cek kembali ejaanmu.
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Recent Notes</h2>
                        {recentNotes.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Belum ada catatan yang tersimpan.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recentNotes.map(note => (
                                    <NoteCard key={note.id} note={note} onSelect={() => alert(`Note selected: ${note.title}`)} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="space-y-4">
                <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {ICONS.sparkles}
                        Tips Cepat
                    </h2>
                    <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <li>
                            Gunakan tombol <span className="font-medium">AI Assistant</span> di kanan bawah untuk berdiskusi dengan Azura kapan saja.
                        </li>
                        <li>
                            Kunjungi tab Notes untuk memperbarui catatan rapat atau janji penting.
                        </li>
                        <li>
                            Catatan akan otomatis tersimpan ke perangkat ini dan bisa dicari kembali kapan saja.
                        </li>
                    </ul>
                </div>
                <div className="rounded-3xl border border-white/40 bg-gradient-to-br from-indigo-100/80 via-sky-100/70 to-white/60 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur-xl text-sm text-indigo-800 dark:border-slate-800/60 dark:bg-gradient-to-br dark:from-indigo-900/60 dark:via-slate-900/60 dark:to-slate-900/60 dark:text-indigo-200">
                    <h3 className="font-semibold mb-2">Butuh bantuan cepat?</h3>
                    <p>
                        Tekan tombol AI untuk membuka panel percakapan. Azura akan membantu menganalisis catatan, membuat ringkasan, atau menjawab pertanyaan seputar kegiatanmu{' '}
                        <span className="font-medium">hingga {formatDate(new Date())}</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};
