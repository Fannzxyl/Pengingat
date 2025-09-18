import React from 'react';

export const ChatMessageSkeleton: React.FC = () => {
    return (
        <div className="flex items-start gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
            <div className="w-full max-w-sm rounded-lg p-3 bg-gray-200 dark:bg-gray-800 rounded-bl-none">
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
        </div>
    );
};
