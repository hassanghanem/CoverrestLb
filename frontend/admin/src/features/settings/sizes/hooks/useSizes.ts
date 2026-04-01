
import { getSizes } from "@/lib/services/Sizes-services";
import { useQuery } from "@tanstack/react-query";

export const useSizes = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Sizes", params],
    queryFn: () => getSizes(params),
    enabled: !!params,
    retry: 1,
  });
};
