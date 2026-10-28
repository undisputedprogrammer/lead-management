import React, { PropsWithChildren, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    LogOut,
    Plus,
    Shield,
    X,
    XCircle,
} from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import { PageProps } from '@/types';

interface AdminLayoutProps {
    title?: string;
}

export default function AdminLayout({
    title = 'User Management',
    children,
}: PropsWithChildren<AdminLayoutProps>) {
    const { auth, flash } = usePage<PageProps>().props;
    const [dismissFlash, setDismissFlash] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans antialiased">
            {/* Top Navigation Bar */}
            <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left: Badge + Title */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-blue-600/20 text-blue-400 rounded-md border border-blue-500/30">
                                    <Shield className="h-4 w-4" />
                                </span>
                                <h1 className="text-lg font-bold tracking-tight text-white">
                                    {title}
                                </h1>
                            </div>
                        </div>

                        {/* Right: Add User Button + Admin Account Dropdown */}
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('admin.users.create')}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <Plus className="h-4 w-4 stroke-[2.5]" />
                                <span>Add User</span>
                            </Link>

                            <div className="h-5 w-px bg-slate-700 mx-1" />

                            {auth.admin && (
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 text-sm text-slate-200 hover:text-white px-2 py-1 rounded-md hover:bg-slate-800 transition-colors focus:outline-none"
                                        >
                                            <span className="font-medium text-xs sm:text-sm">
                                                {auth.admin.name}
                                            </span>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content align="right" width="48">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs font-semibold text-gray-900 truncate">
                                                {auth.admin.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                {auth.admin.email}
                                            </p>
                                        </div>

                                        <Dropdown.Link
                                            href={route('admin.logout')}
                                            method="post"
                                            as="button"
                                            className="flex items-center gap-2 text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Admin Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Flash Messages */}
            {flash?.success && !dismissFlash && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg shadow-xs text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setDismissFlash(true)}
                            className="text-emerald-600 hover:text-emerald-800 p-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {flash?.error && !dismissFlash && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="flex items-center justify-between p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-lg shadow-xs text-sm">
                        <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                            <span>{flash.error}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setDismissFlash(true)}
                            className="text-red-600 hover:text-red-800 p-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>
        </div>
    );
}
