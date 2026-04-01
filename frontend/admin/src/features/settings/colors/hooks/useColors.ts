
import { getColors } from "@/lib/services/Colors-services";
import { useQuery } from "@tanstack/react-query";

export const useColors = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Colors", params],
    queryFn: () => getColors(params),
    enabled: !!params,
    retry: 1,
  });
};
