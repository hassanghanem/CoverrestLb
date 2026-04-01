import { useEffect, useState } from "react";
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
import {
  createCurrency,
  updateCurrency,
  deleteCurrency,
} from "@/lib/services/Currencies-services";
import { toast } from "sonner";
import { Currency } from "@/types/api.interfaces";
import { useCurrencies } from "./useCurrencies";
import type { SortingState } from "@tanstack/react-table";
import { useCurrencyColumns } from "./useCurrencyColumns";
import { CurrencyFormValues } from "@/types/form.interfaces";

export function useCurrenciesTableLogic() {
  const { t: messages } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [isCurrencyFormOpen, setIsCurrencyFormOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingCurrency, setIsDeletingCurrency] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [toggleDefaultDialogOpen, setToggleDefaultDialogOpen] = useState(false);
  const [isTogglingDefault, setIsTogglingDefault] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const handleEditCurrency = (currency: Currency) => {
    setEditingCurrency(currency);
    setIsCurrencyFormOpen(true);
  };

  const handleDeleteCurrencyClick = (currency: Currency) => {
    setSelectedCurrency(currency);
    setDeleteDialogOpen(true);
  };

  const handleToggleDefaultClick = (currency: Currency) => {
    setSelectedCurrency(currency);
    setToggleDefaultDialogOpen(true);
  };

  const handleCurrencyAction = async (
    action: () => Promise<any>,
    errorKey: string
  ) => {
    try {
      const response = await action();
      return response.result;
    } catch {
      toast.error(messages(errorKey));
      return false;
    }
  };

  const prepareCurrencyFormData = (data: CurrencyFormValues) => {
    const formData = new FormData();
    Object.entries(data.name).forEach(([lang, value]) => {
      formData.append(`name[${lang}]`, value);
    });
    formData.append("code", data.code);
    if (data.symbol) formData.append("symbol", data.symbol);
    formData.append("exchange_rate", data.exchange_rate.toString());
    return formData;
  };

  const handleConfirmToggleDefault = async () => {
    if (!selectedCurrency) return;
    setIsTogglingDefault(true);

    const formData = prepareCurrencyFormData(selectedCurrency);
    formData.append("is_default", selectedCurrency.is_default ? "0" : "1");

    const success = await handleCurrencyAction(
      () => updateCurrency(selectedCurrency.id, formData),
      "Default update failed"
    );

    setIsTogglingDefault(false);
    setToggleDefaultDialogOpen(!success);
    if (success) {
      refetch();
      dispatch(fetchSettings());
    }
  };

  const handleConfirmDeleteCurrency = async () => {
    if (!selectedCurrency) return;
    setIsDeletingCurrency(true);

    const success = await handleCurrencyAction(
      () => deleteCurrency(selectedCurrency.id),
      "Delete failed"
    );

    setIsDeletingCurrency(false);
    setDeleteDialogOpen(!success);
    if (success) refetch();
  };

  const handleSubmitCurrencyForm = async (data: any) => {
    const formData = prepareCurrencyFormData(data);

    const success = await handleCurrencyAction(
      () =>
        editingCurrency
          ? updateCurrency(editingCurrency.id, formData)
          : createCurrency(formData),
      "Unexpected error"
    );

    if (success) {
      setEditingCurrency(null);
      setIsCurrencyFormOpen(false);
      refetch();
      dispatch(fetchSettings());
    }
  };

  const columns = useCurrencyColumns({
    handleEdit: handleEditCurrency,
    handleDelete: handleDeleteCurrencyClick,
    handleToggleDefault: handleToggleDefaultClick,
  });

  const { data, isLoading, isError, refetch } = useCurrencies({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    sort: sorting.length ? sorting[0].id : undefined,
    order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
    search: appliedSearch,
  });

  const table = useReactTable({
    data: data?.currencies || [],
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
    messages,
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
    setIsCurrencyFormOpen,
    isCurrencyFormOpen,
    editingCurrency,
    setEditingCurrency,
    handleSubmitCurrencyForm,
    deleteDialogProps: {
      open: deleteDialogOpen,
      onClose: () => setDeleteDialogOpen(false),
      onConfirm: handleConfirmDeleteCurrency,
      loading: isDeletingCurrency,
      title: messages("Delete Currency"),
      description: messages("Are you sure you want to delete this currency?"),
    },
    toggleDefaultDialogProps: {
      open: toggleDefaultDialogOpen,
      onOpenChange: () => setToggleDefaultDialogOpen(false),
      handleConfirm: handleConfirmToggleDefault,
      isLoading: isTogglingDefault,
      title: messages("Toggle Default"),
      desc: selectedCurrency?.is_default
        ? messages("Unset this currency as default?")
        : messages("Set this currency as default?"),
    },
  };
}
