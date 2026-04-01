


import { getContacts } from "@/lib/services/Contacts-services"
import { useQuery } from "@tanstack/react-query";

export const useContacts = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Contacts", params],
    queryFn: () => getContacts(params),
    enabled: !!params,
    retry: 1, 
    
  });
};
