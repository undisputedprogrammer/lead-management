export interface AuthUser {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
}

export interface AuthAdmin {
    id: number;
    name: string;
    email: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: AuthUser;
        admin: AuthAdmin | null;
    };
    flash: {
        success?: string | null;
        error?: string | null;
    };
};
