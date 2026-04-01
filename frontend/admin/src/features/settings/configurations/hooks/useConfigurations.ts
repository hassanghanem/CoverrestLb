
import { getConfigurations} from "@/lib/services/Configurations-services";
import { useQuery } from "@tanstack/react-query";

export const useConfigurations = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["Configurations", params],
    queryFn: () => getConfigurations(params),
    enabled: !!params,
    retry: 1,
  });
};
