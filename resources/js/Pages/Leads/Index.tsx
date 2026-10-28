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
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    // Row selection toggle
    const handleToggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Toggle select all on current page
    const handleToggleSelectAll = () => {
        const selectable = leads.data.filter((l) => l.can.delete).map((l) => l.id);
        const allSelected = selectable.every((id) => selectedIds.includes(id));

        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !selectable.includes(id)));
        } else {
            setSelectedIds((prev) => Array.from(new Set([...prev, ...selectable])));
        }
    };

    // Single delete
    const handleConfirmDelete = () => {
        if (!leadToDelete) return;
        setIsDeleting(true);

        router.delete(route('leads.destroy', leadToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                setLeadToDelete(null);
                setSelectedIds((prev) => prev.filter((id) => id !== leadToDelete.id));
                refreshList();
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    // Bulk delete
    const handleConfirmBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setIsBulkDeleting(true);

        router.post(
            route('leads.bulk-delete'),
            { ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsBulkDeleting(false);
                    setShowBulkDeleteModal(false);
                    setSelectedIds([]);
                    refreshList();
                },
                onError: () => {
                    setIsBulkDeleting(false);
                },
            }
        );
    };

    // Export CSV with current filters
    const handleExport = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('leads.export');

        const csrfToken = (
            document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
        )?.content;

        if (csrfToken) {
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value = csrfToken;
            form.appendChild(tokenInput);
        }

        const entries: Record<string, string> = {
            search: filters.search || '',
            status: filters.status || '',
            sort_direction: filters.sort_direction || 'desc',
        };

        Object.entries(entries).forEach(([key, val]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = val;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    return (
        <AppLayout title="Lead List">
            <Head title="Lead List" />

            <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 overflow-hidden">
                {/* Search, Filter, Sort, Selection and Action Toolbar */}
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
                    selectedCount={selectedIds.length}
                    onBulkDelete={() => setShowBulkDeleteModal(true)}
                    onExport={handleExport}
                />

                {/* Data Table */}
                <LeadTable
                    leads={leads.data}
                    statuses={statuses}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                    onToggleSelectAll={handleToggleSelectAll}
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

            {/* Single Delete Confirmation Modal */}
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

            {/* Bulk Delete Confirmation Modal */}
            <ConfirmModal
                show={showBulkDeleteModal}
                title="Bulk Delete Leads"
                message={`Are you sure you want to delete ${selectedIds.length} selected lead(s)? Only leads you own will be removed.`}
                confirmText={`Delete ${selectedIds.length} Leads`}
                cancelText="Cancel"
                isLoading={isBulkDeleting}
                onConfirm={handleConfirmBulkDelete}
                onClose={() => setShowBulkDeleteModal(false)}
            />
        </AppLayout>
    );
}
