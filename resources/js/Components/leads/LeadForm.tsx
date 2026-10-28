import React from 'react';
import { Link } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Select from '@/Components/ui/Select';
import { LeadStatusOption, LeadStatusValue } from '@/types/lead';

export interface LeadFormData {
    name: string;
    email: string;
    phone: string;
    status: LeadStatusValue;
}

interface LeadFormProps {
    data: LeadFormData;
    setData: <K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) => void;
    errors: Partial<Record<keyof LeadFormData, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    statuses: LeadStatusOption[];
    submitLabel: string;
    cancelHref: string;
}

export default function LeadForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    statuses,
    submitLabel,
    cancelHref,
}: LeadFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Name */}
            <div>
                <InputLabel htmlFor="name" value="Full Name *" />
                <TextInput
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder="e.g. John Doe"
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
                    placeholder="e.g. john@example.com"
                    required
                />
                <InputError message={errors.email} className="mt-1.5" />
            </div>

            {/* Phone */}
            <div>
                <InputLabel htmlFor="phone" value="Phone Number *" />
                <TextInput
                    id="phone"
                    type="text"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder="e.g. +1 (555) 012-3456"
                    required
                />
                <p className="mt-1 text-xs text-gray-500">
                    Format: 7 to 20 digits, numbers, spaces, plus or dashes allowed.
                </p>
                <InputError message={errors.phone} className="mt-1.5" />
            </div>

            {/* Status */}
            <div>
                <InputLabel htmlFor="status" value="Lead Status *" />
                <Select
                    id="status"
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value as LeadStatusValue)}
                    options={statuses}
                    hasError={Boolean(errors.status)}
                    className="mt-1"
                />
                <InputError message={errors.status} className="mt-1.5" />
            </div>

            {/* Action buttons */}
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
