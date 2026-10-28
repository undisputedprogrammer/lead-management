import React from 'react';
import { Link } from '@inertiajs/react';
import { Edit2, Trash2 } from 'lucide-react';
import { LeadItem, LeadStatusOption } from '@/types/lead';
import StatusBadge from './StatusBadge';
import StatusSelect from './StatusSelect';

interface LeadRowProps {
    lead: LeadItem;
    statuses: LeadStatusOption[];
    isSelected?: boolean;
    onToggleSelect?: (id: number) => void;
    onDelete: (lead: LeadItem) => void;
    onStatusUpdated: () => void;
}

export default function LeadRow({
    lead,
    statuses,
    isSelected = false,
    onToggleSelect,
    onDelete,
    onStatusUpdated,
}: LeadRowProps) {
    return (
        <tr className={`hover:bg-gray-50/70 transition-colors border-b border-gray-100 last:border-0 ${isSelected ? 'bg-blue-50/40' : ''}`}>
            {/* Checkbox */}
            <td className="px-4 py-3.5 whitespace-nowrap w-10">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect && onToggleSelect(lead.id)}
                    disabled={!lead.can.delete}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 disabled:opacity-30 disabled:cursor-not-allowed"
                />
            </td>

            {/* Name + Handle */}
            <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 leading-tight">
                        {lead.name}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5 font-normal">
                        {lead.handle}
                    </span>
                </div>
            </td>

            {/* Email Address */}
            <td className="px-4 py-3.5 whitespace-nowrap text-sm text-gray-600 font-medium">
                {lead.email}
            </td>

            {/* Phone Number */}
            <td className="px-4 py-3.5 whitespace-nowrap text-sm text-gray-600">
                {lead.phone}
            </td>

            {/* Status */}
            <td className="px-4 py-3.5 whitespace-nowrap">
                {lead.can.update ? (
                    <StatusSelect
                        lead={lead}
                        statuses={statuses}
                        onSuccess={onStatusUpdated}
                    />
                ) : (
                    <StatusBadge
                        status={lead.status.value}
                        label={lead.status.label}
                    />
                )}
            </td>

            {/* Actions */}
            <td className="px-4 py-3.5 whitespace-nowrap text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                    {lead.can.update && (
                        <Link
                            href={route('leads.edit', lead.id)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit Lead"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Link>
                    )}

                    {lead.can.delete && (
                        <button
                            type="button"
                            onClick={() => onDelete(lead)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Lead"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}

                    {!lead.can.update && !lead.can.delete && (
                        <span className="text-xs text-gray-300 italic px-2">—</span>
                    )}
                </div>
            </td>
        </tr>
    );
}
