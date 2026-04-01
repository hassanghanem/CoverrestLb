import { useState } from "react";
import { useFullPageLoading } from "@/context/FullPageLoadingContext";
import { useGetAllAddresses } from "@/hooks/usePublicData";
import { updateAddress, createAddress, deleteAddress } from "@/lib/services/addresses-service";
import { Address } from "@/types/api.interfaces";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const useAddressesLogic = () => {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const { setFullPageLoading } = useFullPageLoading();
  const { t } = useTranslation();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetAllAddresses({
    page: currentPage,
    per_page: 4,
  });

  const onPageChange = (page: number) => {
    if (page > 0 && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleClose = () => setDialogOpen(false);

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

      const response = selectedAddress
        ? await updateAddress(selectedAddress.id, formData)
        : await createAddress(formData);

      if (response.result) {
        setDialogOpen(false);
        await refetch();
      }
    } catch (error) {
      toast.error(t("An unexpected error occurred. Please try again."));
    }

    setFullPageLoading(false);
  };

  const handleEdit = (address: Address) => {
    setDialogOpen(true);
    setSelectedAddress(address);
  };

  const handleAddNew = () => {
    setDialogOpen(true);
    setSelectedAddress(null);
  };

  const handleDelete = (address: Address) => {
    setAddressToDelete(address);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;

    setFullPageLoading(true);
    try {
      const response = await deleteAddress(addressToDelete.id);
      if (response.result) {
        toast.success(t("Address deleted successfully"));
        await refetch();
      }
    } catch (error) {
      toast.error(t("Failed to delete address. Please try again."));
    }
    setFullPageLoading(false);
    setDeleteConfirmOpen(false);
    setAddressToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setAddressToDelete(null);
  };

  return {
    data,
    isLoading,
    isError,
    selectedAddress,
    isDialogOpen,
    currentPage,
    deleteConfirmOpen,
    addressToDelete,
    onPageChange,
    handleClose,
    handleSubmit,
    handleEdit,
    handleAddNew,
    handleDelete,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
};
