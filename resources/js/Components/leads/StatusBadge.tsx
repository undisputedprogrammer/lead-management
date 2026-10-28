import React from 'react';
import { LeadStatusValue } from '@/types/lead';

interface StatusBadgeProps {
    status: LeadStatusValue;
    label: string;
    className?: string;
}

const statusConfig: Record<
    LeadStatusValue,
    { badgeClass: string; dotClass: string }
> = {
    new: {
        badgeClass: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
        dotClass: 'bg-blue-600',
    },
    contacted: {
        badgeClass: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
        dotClass: 'bg-amber-600',
    },
    converted: {
        badgeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
        dotClass: 'bg-emerald-600',
    },
};

export default function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
    const config = statusConfig[status] ?? {
        badgeClass: 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20',
        dotClass: 'bg-gray-600',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.badgeClass} ${className}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
            {label}
        </span>
    );
}
