import React from 'react';
import { Filter } from 'lucide-react';
import { LeadStatusOption } from '@/types/lead';

interface FilterDropdownProps {
    value: string;
    onChange: (status: string) => void;
    statuses: LeadStatusOption[];
    className?: string;
}

export default function FilterDropdown({
    value,
    onChange,
    statuses,
    className = '',
}: FilterDropdownProps) {
    return (
        <div className={`relative inline-flex items-center ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Filter className="h-4 w-4" />
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-9 pr-8 py-2 text-sm border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-700 font-medium cursor-pointer shadow-sm"
            >
                <option value="">All Statuses</option>
                {statuses.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

