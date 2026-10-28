import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import UserForm, { UserFormData } from '@/Components/admin/UserForm';

export default function AdminUsersCreate() {
    const { data, setData, post, processing, errors } = useForm<UserFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    return (
        <AdminLayout title="Add New User">
            <Head title="Admin - Add User" />

            <div className="max-w-xl mx-auto">
                <div className="mb-4">
                    <Link
                        href={route('admin.dashboard')}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Users
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-6 sm:p-8">
                    <div className="mb-6 border-b border-gray-100 pb-4">
                        <h2 className="text-lg font-bold text-gray-900">
                            Create User Account
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Create a new user account with credentials to access the lead management portal.
                        </p>
                    </div>

                    <UserForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={handleSubmit}
                        submitLabel="Create User"
                        cancelHref={route('admin.dashboard')}
                        isEdit={false}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
