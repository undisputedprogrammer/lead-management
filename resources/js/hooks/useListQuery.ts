import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

interface UseListQueryOptions<TFilters extends { search: string; page: number }> {
    searchRoute: string;
    initialFilters: TFilters;
    onlyProp: string;
}

export function useListQuery<TFilters extends { search: string; page: number }>({
    searchRoute,
    initialFilters,
    onlyProp,
}: UseListQueryOptions<TFilters>) {
    const [filters, setFilters] = useState<TFilters>(initialFilters);
    const [isLoading, setIsLoading] = useState(false);
    const isFirstMount = useRef(true);
    const lastSubmittedSearch = useRef(initialFilters.search);
    const filtersRef = useRef(filters);
    filtersRef.current = filters;

    const debouncedSearch = useDebouncedValue(filters.search, 400);

    const executePost = useCallback(
        (targetFilters: TFilters) => {
            setIsLoading(true);
            router.post(
                searchRoute,
                targetFilters as unknown as Record<string, string | number | boolean | null | undefined>,
                {
                    preserveState: true,
                    preserveScroll: true,
                    preserveUrl: true,
                    only: [onlyProp, 'filters'],
                    onFinish: () => {
                        setIsLoading(false);
                    },
                }
            );
        },
        [searchRoute, onlyProp]
    );

    // Handle debounced search changes
    useEffect(() => {
        if (isFirstMount.current) {
            return;
        }

        if (debouncedSearch !== lastSubmittedSearch.current) {
            lastSubmittedSearch.current = debouncedSearch;
            setFilters((prev) => {
                const next = { ...prev, search: debouncedSearch, page: 1 };
                executePost(next);
                return next;
            });
        }
    }, [debouncedSearch, executePost]);

    // Mark mount completed
    useEffect(() => {
        isFirstMount.current = false;
    }, []);

    // Change field other than search (e.g. status, sort, page)
    const updateFilter = useCallback(
        <K extends keyof TFilters>(key: K, value: TFilters[K]) => {
            setFilters((prev) => {
                if (key === 'search') {
                    return { ...prev, [key]: value };
                }

                const resetsPage = key !== 'page';
                const next = {
                    ...prev,
                    [key]: value,
                    ...(resetsPage ? { page: 1 } : {}),
                };
                executePost(next);
                return next;
            });
        },
        [executePost]
    );

    const setPage = useCallback(
        (page: number) => {
            updateFilter('page' as keyof TFilters, page as unknown as TFilters[keyof TFilters]);
        },
        [updateFilter]
    );

    const refreshList = useCallback(() => {
        executePost(filtersRef.current);
    }, [executePost]);

    return {
        filters,
        setFilters,
        updateFilter,
        setPage,
        refreshList,
        isLoading,
    };
}
