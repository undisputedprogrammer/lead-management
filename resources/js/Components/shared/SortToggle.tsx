import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface SortToggleProps {
    direction: 'asc' | 'desc';
    onToggle: () => void;
    className?: string;
}

export default function SortToggle({ direction, onToggle, className = '' }: SortToggleProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors ${className}`}
            title={`Sort by Date: ${direction === 'asc' ? 'Oldest first' : 'Newest first'}`}
        >
            {direction === 'asc' ? (
                <ArrowUp className="h-4 w-4 text-blue-600" />
            ) : (
                <ArrowDown className="h-4 w-4 text-blue-600" />
            )}
            <span>Sort: {direction === 'asc' ? 'Oldest' : 'Newest'}</span>
        </button>
    );
}

