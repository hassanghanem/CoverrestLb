import { useState } from "react";
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
import { updateSize, createSize, deleteSize } from "@/lib/services/Sizes-services";
import { toast } from "sonner";
import { Size } from "@/types/api.interfaces";
import type { SortingState } from "@tanstack/react-table";
import { useSizeColumns } from "./useSizeColumns";
import { SizeFormValues } from "@/types/form.interfaces";
import { useSizes } from "./useSizes";

export function useSizesTableLogic() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [isSizeFormOpen, setIsSizeFormOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingSize, setIsDeletingSize] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleEditSize = (size: Size) => {
    setEditingSize(size);
    setIsSizeFormOpen(true);
  };

  const handleDeleteSizeClick = (size: Size) => {
    setSelectedSize(size);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteSize = async () => {
    if (!selectedSize) return;
    setIsDeletingSize(true);
    try {
      await deleteSize(selectedSize.id);
    } catch {
      toast.error(t("Delete failed"));
    } finally {
      setIsDeletingSize(false);
      setDeleteDialogOpen(false);
      refetch();
    }
  };

  const handleSubmitSizeForm = async (data: SizeFormValues) => {
    try {
      const formData = new FormData();
      Object.entries(data.name).forEach(([lang, value]) => {
        formData.append(`name[${lang}]`, value);
      });

      const response = editingSize
        ? await updateSize(editingSize.id, formData)
        : await createSize(formData);

      if (response.result) {
        setEditingSize(null);
        setIsSizeFormOpen(false);
        refetch();
        dispatch(fetchSettings());
      }
    } catch {
      toast.error(t("Unexpected Error"));
    }
  };

  const columns = useSizeColumns({
    handleEdit: handleEditSize,
    handleDelete: handleDeleteSizeClick,
  });

  const { data, isLoading, isError, refetch } = useSizes({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    sort: sorting.length ? sorting[0].id : undefined,
    order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
    search: appliedSearch,
  });

  const table = useReactTable({
    data: data?.sizes || [],
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
    handleRefresh,
    setSearchInput,
    searchInput,
    setIsSizeFormOpen,
    isSizeFormOpen,
    editingSize,
    setEditingSize,
    handleSubmitSizeForm,
    deleteDialogProps: {
      open: deleteDialogOpen,
      onClose: () => setDeleteDialogOpen(false),
      onConfirm: handleConfirmDeleteSize,
      loading: isDeletingSize,
      title: t("Delete Size"),
      description: t("Are you sure you want to delete this Size?"),
    },
  };
}
