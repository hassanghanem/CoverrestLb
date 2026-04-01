import { getCoupons } from "@/lib/services/Coupons-services";
import { useQuery } from "@tanstack/react-query";

export const useCoupons = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Coupons", params],
    queryFn: () => getCoupons(params),
    enabled: !!params, 
    retry: 1, 
    
  });
};
