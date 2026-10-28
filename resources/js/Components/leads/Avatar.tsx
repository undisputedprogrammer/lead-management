import React from 'react';

interface AvatarProps {
    initials: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function Avatar({ initials, size = 'md', className = '' }: AvatarProps) {
    const sizeClasses = {
        sm: 'w-7 h-7 text-xs',
        md: 'w-9 h-9 text-xs',
        lg: 'w-11 h-11 text-sm',
    }[size];

    return (
        <div
            className={`inline-flex items-center justify-center rounded-full font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60 select-none ${sizeClasses} ${className}`}
        >
            {initials || '?'}
        </div>
    );
}
