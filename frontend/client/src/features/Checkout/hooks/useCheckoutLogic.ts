import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { useGetCart, useGetDefaultAddress, useSettings, useGetAllAddresses } from "@/hooks/usePublicData";
import { createAddress, updateAddress } from "@/lib/services/addresses-service";
import { useFullPageLoading } from "@/context/FullPageLoadingContext";
import { createOrder } from "@/lib/services/checkout-service";
import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";

export function useCheckoutLogic() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setFullPageLoading } = useFullPageLoading();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const [isEditingDefaultAddress, setIsEditingDefaultAddress] = useState(false);
  const { data: settingsData } = useSettings();
  const configurations = settingsData?.configurations || [];
  const delivery_duration = configurations.find(item => item.key === "delivery_duration")?.value;

  const { data: cartData, refetch: refetchCart, isLoading: isCartLoading } = useGetCart(isAuthenticated);
  const { data: dataDefaultAddress, refetch: refetchDefaultAddress } = useGetDefaultAddress(isAuthenticated);
  const { data: allAddressesData, refetch: refetchAllAddresses } = useGetAllAddresses({ page: 0, per_page: 50 });
  
  const defaultAddress = dataDefaultAddress?.address;
  const allAddresses = allAddressesData?.addresses || [];
  
  // Use selected address or fall back to default address
  const selectedAddress = selectedAddressId 
    ? allAddresses.find(addr => addr.id === selectedAddressId) 
    : defaultAddress;
  const address = selectedAddress;

  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = async (data: any) => {
    setFullPageLoading(true);

    try {
      const formData = new FormData();
      formData.append("city", data.city ?? "");
      formData.append("address", data.address ?? "");
      formData.append("recipient_name", data.recipient_name ?? "");
      formData.append("phone_number", data.phone_number ?? "");
      formData.append("notes", data.notes ?? "");
      formData.append("latitude", data.latitude ?? "");
      formData.append("longitude", data.longitude ?? "");
      formData.append("is_default", data.is_default ? "1" : "0");

      const response = isEditingDefaultAddress && address
        ? await updateAddress(address.id, formData)
        : await createAddress(formData);

      if (response.result) {
        setDialogOpen(false);
        await refetchDefaultAddress();
        await refetchAllAddresses();
      }
    } catch (error) {
      toast.error(t("An unexpected error occurred. Please try again."));
    }

    setFullPageLoading(false);
  };

  const handleCheckOut = async () => {
    setFullPageLoading(true);

    try {
      if (!cartData?.cart || !cartData.cart.items.length) {
        toast.error(t("Your cart is empty"));
        setFullPageLoading(false);
        return;
      }

      if (!address) {
        toast.error(t("Please add a shipping address"));
        setFullPageLoading(false);
        return;
      }

      if (!paymentMethod) {
        toast.error(t("Please select a payment method"));
        setFullPageLoading(false);
        return;
      }

      const response = await createOrder(paymentMethod, orderNotes, address.id);
      if (response.result) {
        await refetchCart();
        navigate("/order-confirmation", { state: { order: response.order } });
      }
    } catch (error) {
      toast.error(t("An unexpected error occurred. Please try again."));
    }

    setFullPageLoading(false);
  };

  const handleClose = () => setDialogOpen(false);

  const openAddAddress = () => {
    setIsEditingDefaultAddress(false);
    setDialogOpen(true);
  };

  const openEditAddress = () => {
    setIsEditingDefaultAddress(true);
    setDialogOpen(true);
  };

  const paymentMethods = [
    {
      id: "cod",
      name: t("Cash on Delivery"),
      icon: "💵",
      description: t("Pay with cash upon delivery"),
    },
    // {
    //   id: 'whish',
    //   name: t('Whish Money'),
    //   icon: '/assets/whish_logo.png',
    //   description: t('Secure digital wallet for payments and transfers')
    // },
  ];

  return {
    isCartLoading,
    cartData,
    address,
    allAddresses,
    selectedAddressId,
    setSelectedAddressId,
    isDialogOpen,
    handleSubmit,
    handleCheckOut,
    handleClose,
    navigate,
    paymentMethod,
    setPaymentMethod,
    orderNotes,
    setOrderNotes,
    isEditingDefaultAddress,
    openEditAddress,
    openAddAddress,
    paymentMethods,
    delivery_duration,
  };
}
