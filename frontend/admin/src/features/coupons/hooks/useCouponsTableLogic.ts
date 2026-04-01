import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AppDispatch } from "@/lib/store/store";
import { fetchSettings } from "@/lib/store/slices/settingsSlice";
import { updateCoupon, createCoupon, deleteCoupon } from "@/lib/services/Coupons-services";
import { toast } from "sonner";
import { Coupon, PaginatedData } from "@/types/api.interfaces";
import { useCoupons } from "./useCoupons";
import type { SortingState } from "@tanstack/react-table";
import { useCouponColumns } from "./useCouponColumns";
import { useAllClients } from "@/hooks/usePublicData";

export function useCouponsTableLogic() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingCoupon, setIsDeletingCoupon] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsCouponFormOpen(true);
  };

  const handleDeleteCouponClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteCoupon = async () => {
    if (!selectedCoupon) return;
    setIsDeletingCoupon(true);
    try {
      await deleteCoupon(selectedCoupon.id);
    } catch {
      toast.error(t("Delete Failed"));
    } finally {
      setIsDeletingCoupon(false);
      setDeleteDialogOpen(false);
      refetch();
    }
  };

  const handleSubmitCouponForm = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append("code", data.code);
      formData.append("type", data.type);
      formData.append("value", data.value.toString());

      if (data.usage_limit != null) formData.append("usage_limit", data.usage_limit.toString());
      if (data.min_order_amount != null) formData.append("min_order_amount", data.min_order_amount.toString());
      formData.append("coupon_type", data.coupon_type.toString());

      if (data.client_id != null) formData.append("client_id", data.client_id.toString());
      if (data.status != null) formData.append("status", data.status.toString());

      formData.append("valid_from", data.valid_from ?? "");
      formData.append("valid_to", data.valid_to ?? "");

      const response = editingCoupon
        ? await updateCoupon(editingCoupon.id, formData)
        : await createCoupon(formData);

      if (response.result) {
        setIsCouponFormOpen(false);
        setEditingCoupon(null);
        refetch();
      }
    } catch (error) {
      toast.error(t("Unexpected Error"));
    }
  };

  const columns = useCouponColumns({
    handleEdit: handleEditCoupon,
    handleDelete: handleDeleteCouponClick,
  });

  const { data, isLoading, isError, refetch } = useCoupons({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    sort: sorting.length ? sorting[0].id : undefined,
    order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
    search: appliedSearch,
  });

  const table = useReactTable({
    data: data?.coupons || [],
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

  const handleRefresh = () => refetch();

  function useAllClientsData(searchTerm: string): PaginatedData<{ id: number; label: string }> {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError: isErrorfetch } = useAllClients(searchTerm);
    const allClients = data?.pages.flatMap((page) => page.clients) || [];
    return {
      items: allClients.map((v) => ({ id: v.id, label: `${v.name} (${v.email})` })),
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
      isError: isErrorfetch,
    };
  }

  return {
    t, // return translation function for components
    table,
    columns,
    data,
    isLoading,
    isError,
    appliedSearch,
    pagination,
    handleSearch,
    handleRefresh,
    setSearchInput,
    searchInput,
    setIsCouponFormOpen,
    isCouponFormOpen,
    editingCoupon,
    setEditingCoupon,
    handleSubmitCouponForm,
    useAllClientsData,
    deleteDialogProps: {
      open: deleteDialogOpen,
      onClose: () => setDeleteDialogOpen(false),
      onConfirm: handleConfirmDeleteCoupon,
      loading: isDeletingCoupon,
      title: t("Delete Coupon"),
      description: t("Confirm delete coupon"),
    },
  };
}
