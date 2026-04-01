import { getStocks } from "@/lib/services/Stocks-services";
import { useQuery } from "@tanstack/react-query";

export const useStocks = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Stocks", params],
    queryFn: () => getStocks(params),
    enabled: !!params, 
    retry: 1, 
    
  });
};
