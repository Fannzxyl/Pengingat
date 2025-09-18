import React from 'react';

export const NoteCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
            <div className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="flex flex-wrap gap-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                </div>
            </div>
        </div>
    );
};
