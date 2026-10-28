import React from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
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
    selectedCount?: number;
    onBulkDelete?: () => void;
    onExport?: () => void;
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
    selectedCount = 0,
    onBulkDelete,
    onExport,
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
                {selectedCount > 0 && onBulkDelete && (
                    <button
                        type="button"
                        onClick={onBulkDelete}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none shadow-xs transition-colors"
                    >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span>Delete Selected ({selectedCount})</span>
                    </button>
                )}

                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg cursor-not-allowed opacity-60 shadow-xs"
                    title="Import (Stretch Item)"
                >
                    <Upload className="h-4 w-4 text-gray-400" />
                    <span>Import</span>
                </button>

                <button
                    type="button"
                    onClick={onExport}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none shadow-xs transition-colors cursor-pointer"
                    title="Export matching leads to CSV"
                >
                    <Download className="h-4 w-4 text-gray-500" />
                    <span>Export</span>
                </button>
            </div>
        </div>
    );
}
