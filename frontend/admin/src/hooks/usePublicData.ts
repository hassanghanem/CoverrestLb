import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getAllClients, getAllOrderableVariants, getAllProducts, getAllProductsVariants, getAllProductsVariantsCanBePreOrder, getAllSettings, getClientAddresses, getOrdersCanBeReturned } from "@/lib/services/Settings-services";
import { GetAllAddressesResponse, GetAllClientsResponse, GetAllOrdersCanBeReturnedResponse, GetAllProductsResponse, GetAllSettingsResponse, GetProductVariantsResponse } from "@/types/response.interfaces";

export const useSettings = () => {
  return useQuery<GetAllSettingsResponse>({
    queryKey: ["settings", "all"],
    queryFn: getAllSettings,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
export const useProductVariants = (searchTerm = "") => {
  return useInfiniteQuery<GetProductVariantsResponse>({
    queryKey: ["productVariants", searchTerm],
    queryFn: ({ pageParam = 1 }) =>
      getAllProductsVariants({
        page: pageParam,
        limit: 20,
        search: searchTerm,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.productVariants.length < lastPage.limit) return undefined;
      return lastPage.page + 1;
    },
    gcTime: 0,
    staleTime: 0, // Always refetch
    refetchOnWindowFocus: false,
  });
};
export const useOrderableVariants = (
  searchTerm = ""
) => {
  return useInfiniteQuery<GetProductVariantsResponse>({
    queryKey: ["OrderableVariants", searchTerm],
    queryFn: ({ pageParam = 1 }) =>
      getAllOrderableVariants({
        page: pageParam,
        limit: 20,
        search: searchTerm,

      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (
        !lastPage ||
        !Array.isArray(lastPage.productVariants) ||
        typeof lastPage.page !== "number" ||
        typeof lastPage.limit !== "number"
      ) {
        return undefined;
      }

      if (lastPage.productVariants.length < lastPage.limit) {
        return undefined;
      }

      return lastPage.page + 1;
    },
    gcTime: 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useAllClients = (searchTerm = "") => {
  return useInfiniteQuery<GetAllClientsResponse>({
    queryKey: ["allClients", searchTerm],
    queryFn: ({ pageParam = 1 }) =>
      getAllClients({
        page: pageParam,
        limit: 20,
        search: searchTerm,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.clients.length < lastPage.limit) return undefined;
      return lastPage.page + 1;
    },
    gcTime: 0,
    staleTime: 0, // Always refetch
    refetchOnWindowFocus: false,
  });
};


export const useClientAddresses = (clientId: number | undefined, searchTerm = "") => {
  return useInfiniteQuery<GetAllAddressesResponse>({
    enabled: !!clientId, // only run if clientId is defined
    queryKey: ["clientAddresses", clientId, searchTerm],
    queryFn: ({ pageParam = 1 }) =>
      getClientAddresses({
        client_id: clientId!,
        page: pageParam,
        limit: 20,
        search: searchTerm,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.addresses.length < lastPage.limit) return undefined;
      return lastPage.page + 1;
    },
    gcTime: 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};


export const useOrdersCanBeReturned = (searchTerm = "") => {
  return useInfiniteQuery<GetAllOrdersCanBeReturnedResponse>({
    queryKey: ["OrderableVariants", searchTerm],
    queryFn: ({ pageParam = 1 }) =>
      getOrdersCanBeReturned({
        page: pageParam,
        limit: 20,
        search: searchTerm,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.orders.length < lastPage.limit) return undefined;
      return lastPage.page + 1;
    },
    gcTime: 0,
    staleTime: 0, // Always refetch
    refetchOnWindowFocus: false,
  });
};

export const useProductVariantsCanBePreOrder = (searchTerm = "") => {
  return useInfiniteQuery<GetProductVariantsResponse>({
    queryKey: ["productVariants", searchTerm],
    queryFn: ({ pageParam = 1 }) =>
      getAllProductsVariantsCanBePreOrder({
        page: pageParam,
        limit: 20,
        search: searchTerm,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.productVariants.length < lastPage.limit) return undefined;
      return lastPage.page + 1;
    },
    gcTime: 0,
    staleTime: 0, // Always refetch
    refetchOnWindowFocus: false,
  });
};

export const useAllProducts = (searchTerm = "") => {
  return useInfiniteQuery<GetAllProductsResponse>({
    queryKey: ["getAllProducts", searchTerm],
    queryFn: ({ pageParam = 1 }) =>
      getAllProducts({
        page: pageParam,
        limit: 20,
        search: searchTerm,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.products.length < lastPage.limit) return undefined;
      return lastPage.page + 1;
    },
    gcTime: 0,
    staleTime: 0, // Always refetch
    refetchOnWindowFocus: false,
  });
};