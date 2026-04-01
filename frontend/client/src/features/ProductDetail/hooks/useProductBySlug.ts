import { getProductBySlug } from "@/lib/services/product-service";
import { useQuery } from "@tanstack/react-query";


export const useProductBySlug = (slug: string) => {
    return useQuery({
        queryKey: ["productById", slug],
        queryFn: () => getProductBySlug(slug),
        enabled: !!slug,
        retry: 1,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });
};
