import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import LeadForm, { LeadFormData } from '@/Components/leads/LeadForm';
import { LeadStatusOption, LeadStatusValue } from '@/types/lead';

interface EditLeadData {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: LeadStatusValue;
}

interface LeadsEditProps {
    lead: EditLeadData;
    statuses: LeadStatusOption[];
}

export default function LeadsEdit({ lead, statuses }: LeadsEditProps) {
    const { data, setData, put, processing, errors } = useForm<LeadFormData>({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('leads.update', lead.id));
    };

    return (
        <AppLayout title="Edit Lead">
            <Head title={`Edit Lead - ${lead.name}`} />

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
                            Edit Lead
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Update the contact information or status for this lead.
                        </p>
                    </div>

                    <LeadForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={handleSubmit}
                        statuses={statuses}
                        submitLabel="Save Changes"
                        cancelHref={route('leads.index')}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
