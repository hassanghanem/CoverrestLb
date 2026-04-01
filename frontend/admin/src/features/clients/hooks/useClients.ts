import { getClients } from "@/lib/services/Clients-services";
import { useQuery } from "@tanstack/react-query";

export const useClients = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Clients", params],
    queryFn: () => getClients(params),
    enabled: !!params, // optional: prevents query from running if params is null
    retry: 1, // optional: retry once on error
    
  });
};
