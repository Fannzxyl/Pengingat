import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';
import { ChatMessage } from '../types';
import { aiChat } from '../services/geminiService';
import { ChatMessageSkeleton } from './skeletons/ChatMessageSkeleton';
import { classNames } from '../utils/helpers';

const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={classNames("flex items-start gap-3", isUser ? "justify-end" : "")}>
            {!isUser && <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white">{ICONS.bot}</div>}
            <div className={classNames(
                "w-full max-w-lg rounded-lg p-3 text-sm whitespace-pre-wrap",
                isUser
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none"
            )}>
                {message.content}
            </div>
             {isUser && <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">{ICONS.user}</div>}
        </div>
    );
}

export const AiChatPanel: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: "Hello! I'm Aura's AI assistant. How can I help you remember or discover something today?", timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const modelResponse: ChatMessage = { role: 'model', content: '', timestamp: new Date() };
        setMessages(prev => [...prev, modelResponse]);

        let completeResponse = "";
        await aiChat.sendMessageStream(input, (chunk) => {
            completeResponse += chunk;
            setMessages(prev =>
                prev.map((msg, index) =>
                    index === prev.length - 1 ? { ...msg, content: completeResponse } : msg
                )
            );
        });
        
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full max-h-[80vh] bg-white dark:bg-gray-800/50 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-lg">Aura AI Assistant</h2>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} />
                ))}
                {isLoading && messages[messages.length-1].role === 'model' && messages[messages.length-1].content === '' && <ChatMessageSkeleton />}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder="Ask me anything..."
                        rows={1}
                        className="flex-1 resize-none block w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-900 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        disabled={isLoading}
                    />
                    <button type="submit" className="p-2.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors" disabled={isLoading || !input.trim()}>
                        {isLoading ? ICONS.spinner : ICONS.send}
                    </button>
                </form>
            </div>
        </div>
    );
};
