import { getReturnOrders } from "@/lib/services/ReturnOrders-services";
import { useQuery } from "@tanstack/react-query";

export const useReturnOrders = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["ReturnOrders", params],
    queryFn: () => getReturnOrders(params),
    enabled: !!params, 
    retry: 1, 
    
  });
};
