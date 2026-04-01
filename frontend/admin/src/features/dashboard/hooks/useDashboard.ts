import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/lib/services/Dashboard-services";
import { GetDashboardResponse } from "@/types/response.interfaces";

export const useDashboard = (params: Record<string, any> = {}) => {
  return useQuery<GetDashboardResponse>({
    queryKey: ["dashboard", params],
    queryFn: () => getDashboard(params),
    retry: 1,
    staleTime: 5 * 60 * 1000, 
  });
};