import { getPreOrders} from "@/lib/services/preorder-services";
import { useQuery } from "@tanstack/react-query";

export const usePreOrders = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["preorder", params],
    queryFn: () => getPreOrders(params),
    enabled: !!params,
    retry: 1, 
    
  });
};
