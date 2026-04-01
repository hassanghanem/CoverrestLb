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
import { updateColor, createColor, deleteColor } from "@/lib/services/Colors-services";
import { toast } from "sonner";
import { Color } from "@/types/api.interfaces";
import { useColors } from "./useColors";
import type { SortingState } from "@tanstack/react-table";
import { useColorColumns } from "./useColorColumns";
import { ColorFormValues } from "@/types/form.interfaces";

export function useColorsTableLogic() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [isColorFormOpen, setIsColorFormOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingColor, setIsDeletingColor] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleEditColor = (color: Color) => {
    setEditingColor(color);
    setIsColorFormOpen(true);
  };

  const handleDeleteColorClick = (color: Color) => {
    setSelectedColor(color);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteColor = async () => {
    if (!selectedColor) return;
    setIsDeletingColor(true);
    try {
      await deleteColor(selectedColor.id);
    } catch {
      toast.error(t("Delete failed"));
    } finally {
      setIsDeletingColor(false);
      setDeleteDialogOpen(false);
      refetch();
    }
  };

  const handleSubmitColorForm = async (data: ColorFormValues) => {
    try {
      const formData = new FormData();
      Object.entries(data.name).forEach(([lang, value]) => {
        formData.append(`name[${lang}]`, value);
      });
      formData.append("code", data.code);

      const response = editingColor
        ? await updateColor(editingColor.id, formData)
        : await createColor(formData);

      if (response.result) {
        setEditingColor(null);
        setIsColorFormOpen(false);
        refetch();
        dispatch(fetchSettings());
      }
    } catch {
      toast.error(t("Unexpected Error"));
    }
  };

  const columns = useColorColumns({
    handleEdit: handleEditColor,
    handleDelete: handleDeleteColorClick,
  });

  const { data, isLoading, isError, refetch } = useColors({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    sort: sorting.length ? sorting[0].id : undefined,
    order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
    search: appliedSearch,
  });

  const table = useReactTable({
    data: data?.colors || [],
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
    setIsColorFormOpen,
    isColorFormOpen,
    editingColor,
    setEditingColor,
    handleSubmitColorForm,
    deleteDialogProps: {
      open: deleteDialogOpen,
      onClose: () => setDeleteDialogOpen(false),
      onConfirm: handleConfirmDeleteColor,
      loading: isDeletingColor,
      title: t("Delete Color"),
      description: t("Are you sure you want to delete this color?"),
    },
  };
}
