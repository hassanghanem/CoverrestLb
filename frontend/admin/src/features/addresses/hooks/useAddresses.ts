import { getAddresses } from "@/lib/services/Addresses-services"; 
import { useQuery } from "@tanstack/react-query";

export const useAddresses = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Addresses", params],
    queryFn: () => getAddresses(params),
    enabled: !!params, 
    retry: 1,
  });
};
