import { getAddresses, getDefaultAddress } from "@/lib/services/addresses-service";
import { getCart } from "@/lib/services/cart-service";
import { getCoupons } from "@/lib/services/coupon-service";
import { getAllSettings } from "@/lib/services/settings-service";
import { getWishlist } from "@/lib/services/wishlist-service";
import {
  GetAddressesResponse,
  GetAddressResponse,
  GetAllSettingsResponse,
  GetCartResponse,
  GetWishlistResponse,
} from "@/types/response.interfaces";
import { useQuery } from "@tanstack/react-query";

export const useSettings = () => {
  return useQuery<GetAllSettingsResponse>({
    queryKey: ["settings", "all"],
    queryFn: getAllSettings,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useGetCart = (enabled: boolean = false) => {
  return useQuery<GetCartResponse>({
    queryKey: ["getCart"],
    queryFn: getCart,
    enabled,  // respect flag passed by caller
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useGetDefaultAddress = (enabled: boolean = false) => {
  return useQuery<GetAddressResponse>({
    queryKey: ["getDefaultAddress"],
    queryFn: getDefaultAddress,
    enabled,
  });
};

export const useGetAllAddresses = (params: Record<string, any>) => {
  return useQuery<GetAddressesResponse>({
    queryKey: ["getAddresses", params],
    queryFn: () => getAddresses(params),
    enabled: !!params,
    retry: 1,
  });
};

export const useGetWishlist = (enabled: boolean = false, params: Record<string, any>) => {
  return useQuery<GetWishlistResponse>({
    queryKey: ["getWishlist"],
    queryFn: () => getWishlist(params),
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useGetCoupons = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["coupons", params],
    queryFn: () => getCoupons(params),
    enabled: !!params, 
    retry: 1,
  });
};