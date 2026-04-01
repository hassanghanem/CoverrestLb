import { getReviews } from "@/lib/services/Reviews-services";
import { useQuery } from "@tanstack/react-query";

export const useReviews = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Reviews", params],
    queryFn: () => getReviews(params),
    enabled: !!params,
    retry: 1,
  });
};
