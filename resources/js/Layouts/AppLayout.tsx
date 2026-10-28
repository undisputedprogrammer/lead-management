import React, { PropsWithChildren, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    CheckCircle2,
    MessageCircle,
    Plus,
    Search,
    Settings,
    X,
    XCircle,
    LogOut,
} from 'lucide-react';
import Avatar from '@/Components/leads/Avatar';
import Dropdown from '@/Components/Dropdown';
import { PageProps } from '@/types';

interface AppLayoutProps {
    title?: string;
}

export default function AppLayout({
    title = 'Lead List',
    children,
}: PropsWithChildren<AppLayoutProps>) {
    const { auth, flash } = usePage<PageProps>().props;
    const [dismissFlash, setDismissFlash] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans antialiased">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-200/80 sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left: Title */}
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold tracking-tight text-gray-900">
                                {title}
                            </h1>
                        </div>

                        {/* Right: Icon row + Add button + User Menu */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Placeholder Header Icons */}
                            <button
                                type="button"
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:inline-flex"
                                title="Search"
                            >
                                <Search className="h-4 w-4" />
                            </button>

                            <button
                                type="button"
                                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:inline-flex"
                                title="WhatsApp"
                            >
                                <MessageCircle className="h-4 w-4" />
                            </button>

                            <button
                                type="button"
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:inline-flex"
                                title="Settings"
                            >
                                <Settings className="h-4 w-4" />
                            </button>

                            <button
                                type="button"
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:inline-flex relative"
                                title="Notifications"
                            >
                                <Bell className="h-4 w-4" />
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
                            </button>

                            {/* Functional Add Lead (+) Button */}
                            <Link
                                href={route('leads.create')}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                title="Add Lead"
                            >
                                <Plus className="h-4 w-4 stroke-[2.5]" />
                                <span className="hidden sm:inline">Add Lead</span>
                            </Link>

                            <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

                            {/* User Avatar + Dropdown */}
                            {auth.user && (
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-400 transition-all focus:outline-none"
                                        >
                                            <Avatar
                                                initials={auth.user.initials || 'U'}
                                                size="sm"
                                            />
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content align="right" width="48">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs font-semibold text-gray-900 truncate">
                                                {auth.user.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                {auth.user.email}
                                            </p>
                                        </div>

                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="flex items-center gap-2 text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Log Out
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

            {/* Page Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>
        </div>
    );
}
