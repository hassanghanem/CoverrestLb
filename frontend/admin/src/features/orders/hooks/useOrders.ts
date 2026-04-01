import { getOrders } from "@/lib/services/Orders-services";
import { useQuery } from "@tanstack/react-query";

export const useOrders = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Orders", params],
    queryFn: () => getOrders(params),
    enabled: !!params, 
    retry: 1,
  });
};
