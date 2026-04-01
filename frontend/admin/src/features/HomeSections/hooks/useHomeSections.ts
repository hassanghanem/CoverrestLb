import { getHomeSectionById, getHomeSections } from "@/lib/services/HomeSections-services";
import { useQuery } from "@tanstack/react-query";

export const useHomeSections = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["HomeSections", params],
    queryFn: () => getHomeSections(params),
    enabled: !!params,
    retry: 1,
  });
};
export const useHomeSectionById = (id: number) => {
  return useQuery({
    queryKey: ["HomeSectionsById", id],
    queryFn: () => getHomeSectionById(id),
    enabled: !!id,
    retry: 1,
    staleTime: 0,    
    gcTime: 0,       
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
