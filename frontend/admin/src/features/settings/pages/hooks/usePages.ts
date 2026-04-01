
import { getPages } from "@/lib/services/Pages-services";
import { useQuery } from "@tanstack/react-query";

export const usePages = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Pages", params],
    queryFn: () => getPages(params),
    enabled: !!params,
    retry: 1,
  });
};
