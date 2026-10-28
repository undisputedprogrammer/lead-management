import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import LeadForm, { LeadFormData } from '@/Components/leads/LeadForm';
import { LeadStatusOption } from '@/types/lead';

interface LeadsCreateProps {
    statuses: LeadStatusOption[];
}

export default function LeadsCreate({ statuses }: LeadsCreateProps) {
    const { data, setData, post, processing, errors } = useForm<LeadFormData>({
        name: '',
        email: '',
        phone: '',
        status: 'new',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('leads.store'));
    };

    return (
        <AppLayout title="Create Lead">
            <Head title="Create Lead" />

            <div className="max-w-2xl mx-auto">
                <div className="mb-4">
                    <Link
                        href={route('leads.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Leads
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-6 sm:p-8">
                    <div className="mb-6 border-b border-gray-100 pb-4">
                        <h2 className="text-lg font-bold text-gray-900">
                            Add New Lead
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Fill in the details below to add a new lead to your pipeline.
                        </p>
                    </div>

                    <LeadForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={handleSubmit}
                        statuses={statuses}
                        submitLabel="Create Lead"
                        cancelHref={route('leads.index')}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
