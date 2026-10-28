import { PaginatedData } from './pagination';

export type LeadStatusValue = 'new' | 'contacted' | 'converted';

export interface LeadStatusOption {
    value: LeadStatusValue;
    label: string;
}

export interface LeadItem {
    id: number;
    name: string;
    email: string;
    phone: string;
    initials: string;
    handle: string;
    status: {
        value: LeadStatusValue;
        label: string;
    };
    created_at: string;
    can: {
        update: boolean;
        delete: boolean;
    };
}

export type PaginatedLeads = PaginatedData<LeadItem>;

export interface LeadFilterState {
    search: string;
    status: string;
    sort_direction: 'asc' | 'desc';
    page: number;
}
