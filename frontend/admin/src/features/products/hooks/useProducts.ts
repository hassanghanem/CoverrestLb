import { getProductById, getProducts } from "@/lib/services/Products-services";
import { useQuery } from "@tanstack/react-query";

export const useProducts = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Products", params],
    queryFn: () => getProducts(params),
    enabled: !!params,
    retry: 1,
  });
};
export const useProductById = (id: number) => {
  return useQuery({
    queryKey: ["ProductById", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    retry: 1,
    staleTime: 0,    
    gcTime: 0,       
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
