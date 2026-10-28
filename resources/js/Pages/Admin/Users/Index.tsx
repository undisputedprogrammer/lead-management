import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Edit2, Trash2, Users } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import SearchInput from '@/Components/shared/SearchInput';
import SortToggle from '@/Components/shared/SortToggle';
import Pagination from '@/Components/shared/Pagination';
import ConfirmModal from '@/Components/ui/ConfirmModal';
import { useListQuery } from '@/hooks/useListQuery';
import { PaginatedUsers, UserFilterState, UserItem } from '@/types/user';

interface AdminUsersIndexProps {
    users: PaginatedUsers;
    filters: UserFilterState;
}

export default function AdminUsersIndex({
    users,
    filters: initialFilters,
}: AdminUsersIndexProps) {
    const {
        filters,
        updateFilter,
        setPage,
        refreshList,
        isLoading,
    } = useListQuery<UserFilterState>({
        searchRoute: route('admin.users.search'),
        initialFilters,
        onlyProp: 'users',
    });

    const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirmDelete = () => {
        if (!userToDelete) return;
        setIsDeleting(true);

        router.delete(route('admin.users.destroy', userToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                setUserToDelete(null);
                refreshList();
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <AdminLayout title="User Management">
            <Head title="Admin - User Management" />

            <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 overflow-hidden">
                {/* Search & Sort Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 flex-1">
                        <SearchInput
                            value={filters.search}
                            onChange={(val) => updateFilter('search', val)}
                            placeholder="Search user name or email..."
                            className="w-full sm:w-80"
                        />
                        <SortToggle
                            direction={filters.sort_direction}
                            onToggle={() =>
                                updateFilter(
                                    'sort_direction',
                                    filters.sort_direction === 'asc' ? 'desc' : 'asc'
                                )
                            }
                        />
                    </div>
                </div>

                {/* Table */}
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
                                <th scope="col" className="px-4 py-3">
                                    Name
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    Email Address
                                </th>
                                <th scope="col" className="px-4 py-3 text-center">
                                    Leads Assigned
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    Created Date
                                </th>
                                <th scope="col" className="px-4 py-3 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50/70 transition-colors border-b border-gray-100 last:border-0"
                                    >
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {user.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap text-sm text-gray-600 font-medium">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                                {user.leads_count ?? 0} leads
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap text-sm text-gray-500">
                                            {user.created_at}
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('admin.users.edit', user.id)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => setUserToDelete(user)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Users className="h-10 w-10 stroke-[1.5] mb-2 text-gray-300" />
                                            <p className="text-sm font-medium text-gray-600">
                                                No users found
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Custom Pagination */}
                <Pagination
                    meta={users.meta}
                    onPageChange={setPage}
                />
            </div>

            {/* Delete Modal */}
            <ConfirmModal
                show={Boolean(userToDelete)}
                title="Delete User"
                message={`Are you sure you want to deactivate and delete user "${userToDelete?.name}"? Soft-deleted users will immediately lose login access, but their associated leads will remain safe.`}
                confirmText="Delete User"
                cancelText="Cancel"
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onClose={() => setUserToDelete(null)}
            />
        </AdminLayout>
    );
}

