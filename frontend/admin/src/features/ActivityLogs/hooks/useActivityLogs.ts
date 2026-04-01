import { getActivityLogs } from "@/lib/services/ActivityLogs-services";
import { useQuery } from "@tanstack/react-query";

export const useActivityLogs = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["ActivityLogs", params],
    queryFn: () => getActivityLogs(params),
    enabled: !!params,
    retry: 1,
  });
};
