import { getTags } from "@/lib/services/Tags-services";
import { useQuery } from "@tanstack/react-query";

export const useTags = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["tags", params],
    queryFn: () => getTags(params),
    enabled: !!params,
    retry: 1,
  });
};
