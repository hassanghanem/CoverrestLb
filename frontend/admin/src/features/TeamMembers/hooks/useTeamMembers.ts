import { getTeamMembers } from "@/lib/services/TeamMembers-services";
import { useQuery } from "@tanstack/react-query";

export const useTeamMembers = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["TeamMembers", params],
    queryFn: () => getTeamMembers(params),
    enabled: !!params,
    retry: 1,
  });
};
