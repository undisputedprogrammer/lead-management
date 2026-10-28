import { PaginatedData } from './pagination';

export interface UserItem {
    id: number;
    name: string;
    email: string;
    initials?: string;
    leads_count?: number;
    created_at?: string;
}

export type PaginatedUsers = PaginatedData<UserItem>;

export interface AdminItem {
    id: number;
    name: string;
    email: string;
}

export interface UserFilterState {
    search: string;
    sort_direction: 'asc' | 'desc';
    page: number;
}
