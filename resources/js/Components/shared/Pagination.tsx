import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '@/types/pagination';

interface PaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
    className?: string;
}

export function getPageNumbers(currentPage: number, lastPage: number): (number | string)[] {
    if (lastPage <= 7) {
        return Array.from({ length: lastPage }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, '...', lastPage];
    }

    if (currentPage >= lastPage - 3) {
        return [
            1,
            '...',
            lastPage - 4,
            lastPage - 3,
            lastPage - 2,
            lastPage - 1,
            lastPage,
        ];
    }

    return [
        1,
        '...',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        '...',
        lastPage,
    ];
}

export default function Pagination({
    meta,
    onPageChange,
    className = '',
}: PaginationProps) {
    const { current_page, last_page, total, from, to } = meta;

    if (total === 0 || last_page <= 1) {
        return (
            <div className={`flex items-center justify-between text-xs text-gray-500 py-3 px-4 ${className}`}>
                <span>Showing {total} result{total === 1 ? '' : 's'}</span>
            </div>
        );
    }

    const pages = getPageNumbers(current_page, last_page);

    return (
        <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4 text-sm text-gray-700 bg-white border-t border-gray-100 ${className}`}
        >
            <div className="text-xs text-gray-500">
                Showing <span className="font-medium text-gray-700">{from ?? 0}</span> to{' '}
                <span className="font-medium text-gray-700">{to ?? 0}</span> of{' '}
                <span className="font-medium text-gray-700">{total}</span> results
            </div>

            <div className="inline-flex items-center gap-1">
                <button
                    type="button"
                    disabled={current_page <= 1}
                    onClick={() => onPageChange(current_page - 1)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Previous</span>
                </button>

                <div className="flex items-center gap-1 mx-1">
                    {pages.map((p, idx) => {
                        if (typeof p === 'string') {
                            return (
                                <span
                                    key={`ellipsis-${idx}`}
                                    className="px-2 py-1 text-xs text-gray-400 select-none"
                                >
                                    …
                                </span>
                            );
                        }

                        const isActive = p === current_page;
                        return (
                            <button
                                key={`page-${p}`}
                                type="button"
                                onClick={() => onPageChange(p)}
                                className={`min-w-[28px] h-7 px-2 text-xs font-medium rounded-md transition-colors ${
                                    isActive
                                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {p}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    disabled={current_page >= last_page}
                    onClick={() => onPageChange(current_page + 1)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
