import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { AppDispatch } from "@/lib/store/store";
import { fetchSettings } from "@/lib/store/slices/settingsSlice";
import { toast } from "sonner";
import { Address } from "@/types/api.interfaces";
import {
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/lib/services/Addresses-services";
import { useAddresses } from "./useAddresses";
import { useAddressColumns } from "./useAddressColumns";
import type { SortingState } from "@tanstack/react-table";
import { useNavigate, useParams } from "react-router-dom";
import { AddressFormValues } from "../components/AddressForm";

export function useAddressesTableLogic() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { ClientId } = useParams<{ ClientId: string }>();

  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);

  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const [toggleDefaultDialogOpen, setToggleDefaultDialogOpen] = useState(false);
  const [isTogglingDefault, setIsTogglingDefault] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    if (!ClientId) navigate(-1);
    dispatch(fetchSettings());
  }, [ClientId, navigate, dispatch]);

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsAddressFormOpen(true);
  };

  const handleDeleteAddressClick = (address: Address) => {
    setSelectedAddress(address);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatusClick = (address: Address) => {
    setSelectedAddress(address);
    setToggleStatusDialogOpen(true);
  };

  const handleToggleDefaultClick = (address: Address) => {
    setSelectedAddress(address);
    setToggleDefaultDialogOpen(true);
  };

  const handleConfirmDeleteAddress = async () => {
    if (!selectedAddress) return;
    setIsDeletingAddress(true);
    try {
      await deleteAddress(selectedAddress.id);
    } catch {
      toast.error(t("Failed to delete address."));
    } finally {
      setIsDeletingAddress(false);
      setDeleteDialogOpen(false);
      setSelectedAddress(null);
      refetch();
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!selectedAddress) return;
    setIsTogglingStatus(true);
    try {
      const newStatus = !selectedAddress.is_active;

      // Use the correct field names that match your API
      const formData = new FormData();
      formData.append("client_id", ClientId || "");
      formData.append("recipient_name", selectedAddress.recipient_name);
      formData.append("address", selectedAddress.address);
      formData.append("phone_number", selectedAddress.phone_number);
      formData.append("city", selectedAddress.city);
      formData.append("notes", selectedAddress.notes || "");
      formData.append("latitude", selectedAddress.latitude || "");
      formData.append("longitude", selectedAddress.longitude || "");
      formData.append("is_active", newStatus ? "1" : "0");
      formData.append("is_default", selectedAddress.is_default ? "1" : "0");

      await updateAddress(selectedAddress.id, formData);
    } catch {
      toast.error(t("Failed to update address status."));
    } finally {
      setIsTogglingStatus(false);
      setToggleStatusDialogOpen(false);
      setSelectedAddress(null);
      refetch();
    }
  };

  const handleConfirmToggleDefault = async () => {
    if (!selectedAddress) return;
    setIsTogglingDefault(true);
    try {
      const newDefault = !selectedAddress.is_default;

      // Use the correct field names that match your API
      const formData = new FormData();
      formData.append("client_id", ClientId || "");
      formData.append("recipient_name", selectedAddress.recipient_name);
      formData.append("address", selectedAddress.address);
      formData.append("phone_number", selectedAddress.phone_number);
      formData.append("city", selectedAddress.city);
      formData.append("notes", selectedAddress.notes || "");
      formData.append("latitude", selectedAddress.latitude || "");
      formData.append("longitude", selectedAddress.longitude || "");
      formData.append("is_active", selectedAddress.is_active ? "1" : "0");
      formData.append("is_default", newDefault ? "1" : "0");

      await updateAddress(selectedAddress.id, formData);
    } catch {
      toast.error(t("Failed to update default address."));
    } finally {
      setIsTogglingDefault(false);
      setToggleDefaultDialogOpen(false);
      setSelectedAddress(null);
      refetch();
    }
  };

  const handleSubmitAddressForm = async (data: AddressFormValues) => {
    try {
      const formData = new FormData();

      if (ClientId) formData.append("client_id", ClientId);
      formData.append("recipient_name", data.recipient_name);
      formData.append("address", data.address);
      formData.append("phone_number", data.phone_number);
      formData.append("city", data.city);
      formData.append("notes", data.notes || "");
      formData.append("latitude", data.latitude || "");
      formData.append("longitude", data.longitude || "");
      formData.append("is_active", "1"); // Default to active when creating/editing
      formData.append("is_default", data.is_default ? "1" : "0");

      const response = editingAddress
        ? await updateAddress(editingAddress.id, formData)
        : await createAddress(formData);

      if (response?.result) {
  
        setEditingAddress(null);
        setIsAddressFormOpen(false);
        refetch();
        dispatch(fetchSettings());
      }
    } catch (error) {
      console.error("Address form error:", error);
      toast.error(t("An unexpected error occurred."));
    }
  };

  const handleCloseAddressForm = () => {
    setEditingAddress(null);
    setIsAddressFormOpen(false);
  };

  const columns = useAddressColumns({
    handleEdit: handleEditAddress,
    handleDelete: handleDeleteAddressClick,
    handleToggleActive: handleToggleStatusClick,
    handleToggleDefault: handleToggleDefaultClick,
  });

  const { data, isLoading, isError, refetch } = useAddresses({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    sort: sorting.length ? sorting[0].id : undefined,
    order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
    search: appliedSearch,
    client_id: ClientId,
  });

  const table = useReactTable({
    data: data?.addresses || [],
    columns,
    pageCount: data?.pagination?.last_page || -1,
    state: { sorting, pagination, globalFilter: appliedSearch },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
  });

  const handleSearch = () => {
    setAppliedSearch(searchInput);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setAppliedSearch("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleRefresh = () => {
    refetch();
  };

  return {
    t,
    table,
    columns,
    data,
    isLoading,
    isError,
    appliedSearch,
    pagination,
    handleSearch,
    handleClearSearch,
    handleRefresh,
    setSearchInput,
    searchInput,
    setIsAddressFormOpen,
    isAddressFormOpen,
    editingAddress,
    setEditingAddress,
    handleSubmitAddressForm,
    handleCloseAddressForm,

    deleteDialogProps: {
      open: deleteDialogOpen,
      onClose: () => {
        setDeleteDialogOpen(false);
        setSelectedAddress(null);
      },
      onConfirm: handleConfirmDeleteAddress,
      loading: isDeletingAddress,
      title: t("Delete Address"),
      description: t("Are you sure you want to delete this address? This action cannot be undone."),
    },

    toggleStatusDialogProps: {
      open: toggleStatusDialogOpen,
      onOpenChange: (open: boolean) => {
        if (!open) {
          setToggleStatusDialogOpen(false);
          setSelectedAddress(null);
        }
      },
      handleConfirm: handleConfirmToggleStatus,
      isLoading: isTogglingStatus,
      title: t("Toggle Address Status"),
      desc: selectedAddress?.is_active
        ? t("Are you sure you want to deactivate this address?")
        : t("Are you sure you want to activate this address?"),
    },

    toggleDefaultDialogProps: {
      open: toggleDefaultDialogOpen,
      onOpenChange: (open: boolean) => {
        if (!open) {
          setToggleDefaultDialogOpen(false);
          setSelectedAddress(null);
        }
      },
      handleConfirm: handleConfirmToggleDefault,
      isLoading: isTogglingDefault,
      title: t("Toggle Default Address"),
      desc: selectedAddress?.is_default
        ? t("Unset as default address?")
        : t("Set this address as default?"),
    },
  };
}