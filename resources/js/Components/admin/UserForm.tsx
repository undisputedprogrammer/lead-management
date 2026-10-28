import React from 'react';
import { Link } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export interface UserFormData {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
}

interface UserFormProps {
    data: UserFormData;
    setData: <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => void;
    errors: Partial<Record<keyof UserFormData, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
    cancelHref: string;
    isEdit?: boolean;
}

export default function UserForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
    cancelHref,
    isEdit = false,
}: UserFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Name */}
            <div>
                <InputLabel htmlFor="name" value="User Name *" />
                <TextInput
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder="e.g. Jane Doe"
                    required
                    autoFocus
                />
                <InputError message={errors.name} className="mt-1.5" />
            </div>

            {/* Email */}
            <div>
                <InputLabel htmlFor="email" value="Email Address *" />
                <TextInput
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder="e.g. jane@example.com"
                    required
                />
                <InputError message={errors.email} className="mt-1.5" />
            </div>

            {/* Password */}
            <div>
                <InputLabel
                    htmlFor="password"
                    value={isEdit ? 'New Password (leave blank to keep current)' : 'Password *'}
                />
                <TextInput
                    id="password"
                    type="password"
                    value={data.password || ''}
                    onChange={(e) => setData('password', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder="••••••••"
                    required={!isEdit}
                />
                <InputError message={errors.password} className="mt-1.5" />
            </div>

            {/* Password Confirmation */}
            <div>
                <InputLabel
                    htmlFor="password_confirmation"
                    value={isEdit ? 'Confirm New Password' : 'Confirm Password *'}
                />
                <TextInput
                    id="password_confirmation"
                    type="password"
                    value={data.password_confirmation || ''}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder="••••••••"
                    required={!isEdit && Boolean(data.password)}
                />
                <InputError message={errors.password_confirmation} className="mt-1.5" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Link
                    href={cancelHref}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors"
                >
                    Cancel
                </Link>
                <Button type="submit" variant="primary" isLoading={processing}>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
