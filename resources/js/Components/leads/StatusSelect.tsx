import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { LeadItem, LeadStatusOption, LeadStatusValue } from '@/types/lead';

interface StatusSelectProps {
    lead: LeadItem;
    statuses: LeadStatusOption[];
    onSuccess: () => void;
}

const statusColors: Record<LeadStatusValue, string> = {
    new: 'text-blue-700 bg-blue-50 border-blue-200 focus:ring-blue-500',
    contacted: 'text-amber-700 bg-amber-50 border-amber-200 focus:ring-amber-500',
    converted: 'text-emerald-700 bg-emerald-50 border-emerald-200 focus:ring-emerald-500',
};

export default function StatusSelect({ lead, statuses, onSuccess }: StatusSelectProps) {
    const [currentStatus, setCurrentStatus] = useState<LeadStatusValue>(lead.status.value);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as LeadStatusValue;
        const prevStatus = currentStatus;
        setCurrentStatus(newStatus);
        setIsUpdating(true);

        router.patch(
            route('leads.status', lead.id),
            { status: newStatus },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsUpdating(false);
                    onSuccess();
                },
                onError: () => {
                    setCurrentStatus(prevStatus);
                    setIsUpdating(false);
                },
            }
        );
    };

    const colorClass = statusColors[currentStatus] || 'text-gray-700 bg-gray-50 border-gray-200';

    return (
        <div className="relative inline-block">
            <select
                value={currentStatus}
                onChange={handleChange}
                disabled={isUpdating}
                className={`text-xs font-medium rounded-full py-1 pl-2.5 pr-7 border shadow-none transition-colors cursor-pointer disabled:opacity-50 ${colorClass}`}
            >
                {statuses.map((s) => (
                    <option key={s.value} value={s.value} className="bg-white text-gray-800">
                        {s.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
