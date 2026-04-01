import { getOrders } from "@/lib/services/order-service";
import { useQuery } from "@tanstack/react-query";

export const useOrders = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["order", params],
    queryFn: () => getOrders(params),
    enabled: !!params, 
    retry: 1,
  });
};
