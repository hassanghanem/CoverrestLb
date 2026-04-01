import { fetchShop } from '@/lib/services/shop-service';
import { useInfiniteQuery } from '@tanstack/react-query';

type ShopFilters = {
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    per_page: number;
    categories?: number[];
    homeSections?: number[];
    sizes?: number[];
    colors?: number[];
    brands?: number[];
    priceRange?: [number, number];
};

export const useShop = (filters: ShopFilters, enabled: boolean = true) => {
    const key = [
        'shop',
        filters.search || '',
        filters.sort || '',
        filters.categories?.join(',') || '',
        filters.sizes?.join(',') || '',
        filters.colors?.join(',') || '',
        filters.sizes?.join(',') || '',
        filters.brands?.join(',') || '',
        filters.homeSections?.join(',') || '',
        filters.priceRange ? filters.priceRange[0] : 0,
        filters.priceRange ? filters.priceRange[1] : 1000,
    ];

    return useInfiniteQuery({
        queryKey: key,
        queryFn: ({ pageParam = 1 }) => fetchShop({ ...filters, page: pageParam }),
        enabled,
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.current_page < lastPage.pagination.last_page) {
                return lastPage.pagination.current_page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
};
