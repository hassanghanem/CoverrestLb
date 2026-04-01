import { getPreOrders} from "@/lib/services/PreOrders-services";
import { useQuery } from "@tanstack/react-query";

export const usePreOrders = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["PreOrders", params],
    queryFn: () => getPreOrders(params),
    enabled: !!params, 
    retry: 1, 
    
  });
};
