import { getHome } from "@/lib/services/home-service";
import { useQuery } from "@tanstack/react-query";


export const useHome = () => {
    return useQuery({
        queryKey: ["home"],
        queryFn: getHome,
        staleTime: 1000 * 60 * 5, 
        retry: 1, 
    });
};
