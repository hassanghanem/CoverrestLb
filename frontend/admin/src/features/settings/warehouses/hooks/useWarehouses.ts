import { getWarehouses } from "@/lib/services/Warehouses-services";
import { useQuery } from "@tanstack/react-query";

export const useWarehouses = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Warehouses", params],
    queryFn: () => getWarehouses(params),
    enabled: !!params,
    retry: 1,
  });
};
