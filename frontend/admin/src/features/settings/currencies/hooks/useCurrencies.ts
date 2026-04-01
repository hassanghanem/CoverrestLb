
import { getCurrencies } from "@/lib/services/Currencies-services";
import { useQuery } from "@tanstack/react-query";

export const useCurrencies = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Currencies", params],
    queryFn: () => getCurrencies(params),
    enabled: !!params,
    retry: 1,
  });
};