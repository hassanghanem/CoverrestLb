import { getTeamMembers } from "@/lib/services/teamMembers-service";
import { useQuery } from "@tanstack/react-query";

export const useTeamMembers = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["teamMembers", params],
    queryFn: () => getTeamMembers(params),
    enabled: !!params,
    retry: 1,
  });
};
