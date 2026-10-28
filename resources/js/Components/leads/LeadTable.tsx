import React from 'react';
import { UserCheck } from 'lucide-react';
import { LeadItem, LeadStatusOption } from '@/types/lead';
import LeadRow from './LeadRow';

interface LeadTableProps {
    leads: LeadItem[];
    statuses: LeadStatusOption[];
    isLoading?: boolean;
    onDelete: (lead: LeadItem) => void;
    onStatusUpdated: () => void;
}

export default function LeadTable({
    leads,
    statuses,
    isLoading = false,
    onDelete,
    onStatusUpdated,
}: LeadTableProps) {
    return (
        <div className="relative overflow-x-auto">
            {isLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                        <svg
                            className="animate-spin h-4 w-4 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Updating...
                    </div>
                </div>
            )}

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        <th scope="col" className="px-4 py-3 w-10">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                disabled
                            />
                        </th>
                        <th scope="col" className="px-4 py-3">
                            Name
                        </th>
                        <th scope="col" className="px-4 py-3">
                            Email address
                        </th>
                        <th scope="col" className="px-4 py-3">
                            Phone Number
                        </th>
                        <th scope="col" className="px-4 py-3">
                            Status
                        </th>
                        <th scope="col" className="px-4 py-3 text-right">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {leads.length > 0 ? (
                        leads.map((lead) => (
                            <LeadRow
                                key={lead.id}
                                lead={lead}
                                statuses={statuses}
                                onDelete={onDelete}
                                onStatusUpdated={onStatusUpdated}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-4 py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <UserCheck className="h-10 w-10 stroke-[1.5] mb-2 text-gray-300" />
                                    <p className="text-sm font-medium text-gray-600">
                                        No leads found
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Try adjusting your search or filter options.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
