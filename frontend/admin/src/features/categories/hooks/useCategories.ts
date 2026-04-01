import { getCategories } from "@/lib/services/Categories-services";
import { useQuery } from "@tanstack/react-query";

export const useCategories = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Categories", params],
    queryFn: () => getCategories(params),
    enabled: !!params,
    retry: 1,
  });
};
