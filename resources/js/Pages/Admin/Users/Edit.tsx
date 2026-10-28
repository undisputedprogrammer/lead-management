import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import UserForm, { UserFormData } from '@/Components/admin/UserForm';

interface EditUserData {
    id: number;
    name: string;
    email: string;
}

interface AdminUsersEditProps {
    user: EditUserData;
}

export default function AdminUsersEdit({ user }: AdminUsersEditProps) {
    const { data, setData, put, processing, errors } = useForm<UserFormData>({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    return (
        <AdminLayout title="Edit User">
            <Head title={`Admin - Edit ${user.name}`} />

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
                            Edit User Account
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Update user profile information or reset their password.
                        </p>
                    </div>

                    <UserForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={handleSubmit}
                        submitLabel="Save Changes"
                        cancelHref={route('admin.dashboard')}
                        isEdit={true}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
