import React from 'react';
import { Download, Upload } from 'lucide-react';
import SearchInput from './SearchInput';
import FilterDropdown from './FilterDropdown';
import SortToggle from './SortToggle';
import { LeadStatusOption } from '@/types/lead';

interface ToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    status: string;
    onStatusChange: (status: string) => void;
    statuses?: LeadStatusOption[];
    sortDirection: 'asc' | 'desc';
    onSortToggle: () => void;
    showStatusFilter?: boolean;
    searchPlaceholder?: string;
    className?: string;
}

export default function Toolbar({
    search,
    onSearchChange,
    status,
    onStatusChange,
    statuses = [],
    sortDirection,
    onSortToggle,
    showStatusFilter = true,
    searchPlaceholder = 'Search name, email...',
    className = '',
}: ToolbarProps) {
    return (
        <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 bg-white border-b border-gray-100 ${className}`}
        >
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
                <SearchInput
                    value={search}
                    onChange={onSearchChange}
                    placeholder={searchPlaceholder}
                    className="w-full sm:w-64"
                />

                {showStatusFilter && (
                    <FilterDropdown
                        value={status}
                        onChange={onStatusChange}
                        statuses={statuses}
                    />
                )}

                <SortToggle
                    direction={sortDirection}
                    onToggle={onSortToggle}
                />
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none shadow-sm transition-colors cursor-not-allowed opacity-80"
                    title="Import (Stretch item)"
                >
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span>Import</span>
                </button>

                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none shadow-sm transition-colors cursor-not-allowed opacity-80"
                    title="Export (Stretch item)"
                >
                    <Download className="h-4 w-4 text-gray-500" />
                    <span>Export</span>
                </button>
            </div>
        </div>
    );
}
