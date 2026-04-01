import { getBrands } from "@/lib/services/Brands-services";
import { useQuery } from "@tanstack/react-query";

export const useBrands = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Brands", params],
    queryFn: () => getBrands(params),
    enabled: !!params,
    retry: 1,
  });
};
