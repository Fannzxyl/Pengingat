import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';
import { ChatMessage, Note } from '../types';
import { aiChat } from '../services/geminiService';
import { ChatMessageSkeleton } from './skeletons/ChatMessageSkeleton';
import { classNames, formatDate } from '../utils/helpers';
import { getDefaultNotes, loadNotesFromStorage, saveNotesToStorage } from '../services/noteStorage';

const ASSISTANT_NAME = 'Azura';
const STORAGE_KEY = 'azura-ai-chat-history';
const SCHEDULE_KEYWORDS = [
    'janji',
    'meeting',
    'rapat',
    'urusan',
    'kegiatan',
    'acara',
    'appointment',
    'jadwal',
    'schedule',
    'temu',
];
const SCHEDULE_CREATION_KEYWORDS = [
    'buatkan jadwal',
    'buat jadwal',
    'tolong buatkan jadwal',
    'tolong jadwalkan',
    'jadwalkan',
    'atur jadwal',
    'buatkan pengingat',
    'ingatkan aku',
    'susun jadwal',
    'buat agenda',
];
const DESCRIPTION_STOPWORDS = [
    'tolong',
    'dong',
    'ya',
    'please',
    'aku',
    'saya',
    'untuk',
    'pada',
    'di',
    'ke',
    'agar',
    'mohon',
    'bisa',
    'jadwal',
    'jadwalkan',
    'schedule',
    'buatkan',
    'buat',
    'susun',
    'atur',
    'pengingat',
    'ingatkan',
    'hari',
    'tanggal',
    'bulan',
    'tahun',
    'besok',
    'lusa',
    'minggu',
    'depan',
    'ini',
    'malam',
    'sore',
    'pagi',
    'siang',
    'jam',
    'pukul',
    'pada',
];

interface AiChatPanelProps {
    onClose?: () => void;
    className?: string;
}

interface ParsedTime {
    hours: number;
    minutes: number;
}

const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={classNames('flex items-start gap-3', isUser ? 'justify-end' : '')}>
            {!isUser && <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white">{ICONS.bot}</div>}
            <div
                className={classNames(
                    'w-full max-w-lg rounded-2xl p-3 text-sm whitespace-pre-wrap shadow-sm backdrop-blur',
                    isUser
                        ? 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-500 text-white rounded-br-none shadow-lg shadow-indigo-500/25'
                        : 'bg-white/75 border border-white/40 text-slate-800 dark:bg-slate-900/60 dark:border-slate-800/60 dark:text-slate-100 rounded-bl-none'
                )}
            >
                {message.content}
            </div>
            {isUser && <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">{ICONS.user}</div>}
        </div>
    );
};

function loadHistory(): ChatMessage[] {
    const greeting: ChatMessage = {
        role: 'model',
        content: `Hai! Aku ${ASSISTANT_NAME}, asisten memorimu. Ceritakan saja apa yang ingin kamu ingat atau rencanakan.`,
        timestamp: new Date(),
    };

    if (typeof window === 'undefined' || !window.localStorage) {
        return [greeting];
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return [greeting];
    }
    try {
        const parsed = JSON.parse(raw) as Array<Omit<ChatMessage, 'timestamp'> & { timestamp: string }>;
        return parsed.map(message => ({ ...message, timestamp: new Date(message.timestamp) }));
    } catch (error) {
        console.error('Failed to parse AI chat history:', error);
        window.localStorage.removeItem(STORAGE_KEY);
        return [greeting];
    }
}

function persistHistory(messages: ChatMessage[]): void {
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }
    const payload = messages.map(message => ({ ...message, timestamp: message.timestamp.toISOString() }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function startOfDay(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

function addDays(date: Date, days: number): Date {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
}

function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

const INDO_MONTHS: Record<string, number> = {
    januari: 0,
    februari: 1,
    maret: 2,
    april: 3,
    mei: 4,
    juni: 5,
    juli: 6,
    agustus: 7,
    september: 8,
    oktober: 9,
    november: 10,
    desember: 11,
};

function parseDateFromQuery(query: string): Date | null {
    const lower = query.toLowerCase();
    const today = startOfDay(new Date());

    if (lower.includes('hari ini')) {
        return today;
    }
    if (lower.includes('besok')) {
        return startOfDay(addDays(today, 1));
    }
    if (lower.includes('lusa')) {
        return startOfDay(addDays(today, 2));
    }

    const isoMatch = query.match(/\b(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})\b/);
    if (isoMatch) {
        const [, year, month, day] = isoMatch;
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        return isNaN(date.getTime()) ? null : startOfDay(date);
    }

    const englishMatch = query.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4}\b/i);
    if (englishMatch) {
        const cleaned = englishMatch[0].replace(',', '');
        const date = new Date(cleaned);
        return isNaN(date.getTime()) ? null : startOfDay(date);
    }

    const indoMatch = query.match(/\b(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*(\d{4})?\b/i);
    if (indoMatch) {
        const [, dayStr, monthStr, yearStr] = indoMatch;
        const monthIndex = INDO_MONTHS[monthStr.toLowerCase()];
        const year = yearStr ? Number(yearStr) : today.getFullYear();
        const day = Number(dayStr);
        const date = new Date(year, monthIndex, day);
        return isNaN(date.getTime()) ? null : startOfDay(date);
    }

    return null;
}

function noteMatchesKeywords(note: Note, keywords: string[]): boolean {
    const haystack = [
        note.title,
        note.content_text ?? '',
        ...(note.tags ?? []),
    ]
        .join(' ')
        .toLowerCase();
    return keywords.some(keyword => haystack.includes(keyword));
}

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }
    return `${text.slice(0, maxLength - 3)}...`;
}

function extractTimeFromQuery(query: string): ParsedTime | null {
    const timeWithPrefix = query.match(/(?:jam|pukul)\s*(\d{1,2})(?:[:.](\d{1,2}))?\s*(am|pm|a\.m\.|p\.m\.|pagi|siang|sore|malam)?/i);
    const fallbackTime = query.match(/\b(\d{1,2})[:.](\d{1,2})\s*(am|pm|a\.m\.|p\.m\.|pagi|siang|sore|malam)?/i);
    const match = timeWithPrefix ?? fallbackTime;
    if (!match) {
        return null;
    }

    const [, hourStr, minuteStr, period] = match;
    let hours = Number(hourStr);
    const minutes = minuteStr ? Number(minuteStr) : 0;

    if (isNaN(hours) || isNaN(minutes) || hours > 23) {
        return null;
    }

    const periodLower = (period ?? '').toLowerCase();
    const isPM = ['pm', 'p.m.', 'sore', 'malam'].some(label => periodLower.includes(label));
    const isAM = ['am', 'a.m.', 'pagi'].some(label => periodLower.includes(label));
    const isNoon = periodLower.includes('siang');

    if (isPM && hours < 12) {
        hours += 12;
    }
    if ((isAM || isNoon) && hours === 12) {
        hours = isNoon ? 12 : 0;
    }
    if (isNoon && hours < 11) {
        hours = 12;
    }

    hours = Math.min(hours, 23);

    return { hours, minutes };
}

function formatTimeLabel(time: ParsedTime): string {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`;
}

function buildScheduleDescription(question: string): string {
    let descriptionSource = question;
    const triggerRegex = /(jadwal|schedule|agenda|pengingat)/i;
    const triggerMatch = question.match(triggerRegex);
    if (triggerMatch) {
        const index = question.toLowerCase().indexOf(triggerMatch[0].toLowerCase());
        descriptionSource = question.slice(index + triggerMatch[0].length);
    }

    descriptionSource = descriptionSource
        .replace(/(?:hari ini|besok|lusa|minggu depan|bulan depan)/gi, '')
        .replace(/(?:jam|pukul)\s*\d{1,2}(?:[:.]\d{1,2})?\s*(?:am|pm|a\.m\.|p\.m\.|pagi|siang|sore|malam)?/gi, '')
        .replace(/\b\d{4}[-\/]\d{1,2}[-\/]\d{1,2}\b/gi, '')
        .replace(/\b\d{1,2}\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*(\d{4})?\b/gi, '');

    const words = descriptionSource
        .split(/\s+/)
        .map(word => word.trim())
        .filter(Boolean)
        .filter(word => !DESCRIPTION_STOPWORDS.includes(word.toLowerCase()))
        .filter(word => !/^[0-9]+$/.test(word));

    const description = words.join(' ').trim();
    if (!description) {
        return 'Agenda penting';
    }
    return description.charAt(0).toUpperCase() + description.slice(1);
}

function attemptScheduleCreation(question: string): string | null {
    const lower = question.toLowerCase();
    const hasIntent = SCHEDULE_CREATION_KEYWORDS.some(keyword => lower.includes(keyword));
    if (!hasIntent) {
        return null;
    }

    const scheduleDate = parseDateFromQuery(question) ?? startOfDay(addDays(new Date(), 1));
    const parsedTime = extractTimeFromQuery(question) ?? { hours: 9, minutes: 0 };
    const scheduledDateTime = new Date(scheduleDate);
    scheduledDateTime.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);

    const description = buildScheduleDescription(question);
    const note: Note = {
        id: `sched-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        userId: 'u1',
        title: `Jadwal: ${description}`,
        type: 'text',
        content_text: `Agenda: ${description}\nWaktu: ${formatDate(scheduledDateTime)} at ${formatTimeLabel(parsedTime)}\nSumber: Dibuat oleh ${ASSISTANT_NAME}.`,
        tags: ['schedule', 'azura'],
        createdAt: scheduledDateTime,
        updatedAt: new Date(),
    };

    const existing = loadNotesFromStorage();
    saveNotesToStorage([note, ...existing]);

    return `Berhasil! Aku sudah menjadwalkan "${description}" untuk ${formatDate(scheduledDateTime)} at ${formatTimeLabel(parsedTime)}. Cek tag #schedule di Notes kapan saja.`;
}

function buildScheduleSummary(question: string): string | null {
    const notes = loadNotesFromStorage();
    const source = notes.length > 0 ? notes : getDefaultNotes();
    if (source.length === 0) {
        return null;
    }

    const queryLower = question.toLowerCase();
    const requestedDate = parseDateFromQuery(question);
    const hasScheduleIntent = SCHEDULE_KEYWORDS.some(keyword => queryLower.includes(keyword));

    if (!hasScheduleIntent && !requestedDate) {
        return null;
    }

    let relevant = [...source];
    if (requestedDate) {
        relevant = relevant.filter(note => isSameDay(note.createdAt, requestedDate));
    }

    if (hasScheduleIntent) {
        relevant = relevant.filter(note => noteMatchesKeywords(note, SCHEDULE_KEYWORDS));
    } else if (!requestedDate) {
        const tokens = queryLower.split(/\s+/).filter(Boolean);
        relevant = relevant.filter(note => noteMatchesKeywords(note, tokens));
    }

    if (relevant.length === 0) {
        if (requestedDate) {
            return `Aku belum menemukan catatan janji atau urusan pada ${formatDate(requestedDate)}. Coba pastikan kamu sudah menyimpannya di Notes atau minta aku membuat jadwal baru.`;
        }
        return 'Belum ada catatan jadwal yang tersimpan. Kamu bisa memintaku membuat jadwal baru kapan saja.';
    }

    relevant.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const lines = relevant.slice(0, 5).map(note => {
        const details = note.content_text?.trim();
        const summary = details ? truncate(details.replace(/\s+/g, ' '), 120) : (note.tags ?? []).join(', ');
        const suffix = summary ? ` - ${summary}` : '';
        return `- ${formatDate(note.createdAt)} | ${note.title}${suffix}`;
    });

    const extraCount = relevant.length - lines.length;
    const intro = requestedDate
        ? `Berikut catatan yang kamu simpan untuk ${formatDate(requestedDate)}:`
        : 'Ini catatan jadwal dan janji yang berhasil aku temukan:';

    return `${intro}\n${lines.join('\n')}${extraCount > 0 ? `\n(+${extraCount} catatan lagi)` : ''}`;
}

function handleLocalQuestion(question: string): string | null {
    return attemptScheduleCreation(question) ?? buildScheduleSummary(question);
}

export const AiChatPanel: React.FC<AiChatPanelProps> = ({ onClose, className }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory());
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        persistHistory(messages);
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const updateLastMessage = (updater: (message: ChatMessage) => ChatMessage) => {
        setMessages(prev => {
            if (prev.length === 0) {
                return prev;
            }
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = updater(updated[lastIndex]);
            return updated;
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        if (!input.trim() || isLoading) {
            return;
        }

        const userMessage: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
        const modelResponse: ChatMessage = { role: 'model', content: '', timestamp: new Date() };

        setMessages(prev => [...prev, userMessage, modelResponse]);
        const question = input;
        setInput('');
        setIsLoading(true);

        try {
            const localAnswer = handleLocalQuestion(question);
            if (localAnswer) {
                updateLastMessage(message => ({ ...message, content: localAnswer }));
                return;
            }

            let completeResponse = '';
            await aiChat.sendMessageStream(question, chunk => {
                completeResponse += chunk;
                updateLastMessage(message => ({ ...message, content: completeResponse }));
            });
        } catch (error) {
            console.error('Azura chat error:', error);
            updateLastMessage(message => ({ ...message, content: 'Maaf, aku kesulitan menjawab sekarang. Coba lagi sebentar lagi, ya.' }));
        } finally {
            setIsLoading(false);
        }
    };

    const lastMessage = messages[messages.length - 1];

    return (
        <div className={classNames('flex flex-col h-full max-h-[80vh] rounded-3xl border border-white/40 bg-white/80 shadow-2xl shadow-indigo-500/20 backdrop-blur-2xl dark:border-slate-800/60 dark:bg-slate-900/70', className)}>
            <div className="flex items-center justify-between p-4 border-b border-white/40 dark:border-slate-800/60">
                <h2 className="font-semibold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                    {ICONS.sparkles}
                    {ASSISTANT_NAME} AI Assistant
                </h2>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/40 bg-white/60 text-slate-500 transition hover:bg-white/80 dark:border-slate-800/60 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800/80"
                        aria-label="Tutup percakapan AI"
                    >
                        {ICONS.close}
                    </button>
                )}
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <Message key={`${msg.timestamp.toISOString()}-${index}`} message={msg} />
                ))}
                {isLoading && lastMessage && lastMessage.role === 'model' && lastMessage.content === '' && <ChatMessageSkeleton />}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <textarea
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                handleSubmit(event);
                            }
                        }}
                        placeholder="Tanyakan apa saja..."
                        rows={1}
                        className="flex-1 resize-none block w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300/60 transition duration-200"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="p-3 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-500 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-sky-600 disabled:bg-indigo-300/70 disabled:text-white/70 disabled:cursor-not-allowed transition-all"
                        disabled={isLoading || !input.trim()}
                    >
                        {isLoading ? ICONS.spinner : ICONS.send}
                    </button>
                </form>
            </div>
        </div>
    );
};
