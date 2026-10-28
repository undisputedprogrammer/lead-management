import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Toolbar from '@/Components/shared/Toolbar';
import Pagination from '@/Components/shared/Pagination';
import LeadTable from '@/Components/leads/LeadTable';
import ConfirmModal from '@/Components/ui/ConfirmModal';
import { useListQuery } from '@/hooks/useListQuery';
import {
    LeadFilterState,
    LeadItem,
    LeadStatusOption,
    PaginatedLeads,
} from '@/types/lead';

interface LeadsIndexProps {
    leads: PaginatedLeads;
    statuses: LeadStatusOption[];
    filters: LeadFilterState;
}

export default function LeadsIndex({
    leads,
    statuses,
    filters: initialFilters,
}: LeadsIndexProps) {
    const {
        filters,
        updateFilter,
        setPage,
        refreshList,
        isLoading,
    } = useListQuery<LeadFilterState>({
        searchRoute: route('leads.search'),
        initialFilters,
        onlyProp: 'leads',
    });

    const [leadToDelete, setLeadToDelete] = useState<LeadItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirmDelete = () => {
        if (!leadToDelete) return;
        setIsDeleting(true);

        router.delete(route('leads.destroy', leadToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                setLeadToDelete(null);
                refreshList();
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <AppLayout title="Lead List">
            <Head title="Lead List" />

            <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 overflow-hidden">
                {/* Search, Filter, Sort and Action Toolbar */}
                <Toolbar
                    search={filters.search}
                    onSearchChange={(val) => updateFilter('search', val)}
                    status={filters.status}
                    onStatusChange={(st) => updateFilter('status', st)}
                    statuses={statuses}
                    sortDirection={filters.sort_direction}
                    onSortToggle={() =>
                        updateFilter(
                            'sort_direction',
                            filters.sort_direction === 'asc' ? 'desc' : 'asc'
                        )
                    }
                />

                {/* Data Table */}
                <LeadTable
                    leads={leads.data}
                    statuses={statuses}
                    isLoading={isLoading}
                    onDelete={(lead) => setLeadToDelete(lead)}
                    onStatusUpdated={refreshList}
                />

                {/* Custom Pagination */}
                <Pagination
                    meta={leads.meta}
                    onPageChange={setPage}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                show={Boolean(leadToDelete)}
                title="Delete Lead"
                message={`Are you sure you want to delete lead "${leadToDelete?.name}"? This action can be undone by an administrator.`}
                confirmText="Delete Lead"
                cancelText="Cancel"
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onClose={() => setLeadToDelete(null)}
            />
        </AppLayout>
    );
}
