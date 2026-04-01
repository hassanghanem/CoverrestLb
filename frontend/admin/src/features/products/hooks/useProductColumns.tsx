import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { TableHeaderSort } from "@/components/datatable/table-header-sort";
import { useTranslation } from "react-i18next";
import { Product } from "@/types/api.interfaces";
import { useNavigate } from "react-router-dom";
import { SUPPORTED_LANGS } from "@/i18n";
import { formatPrice } from "@/utils/formatPrice";
import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";
import { getText } from "@/utils/getText";
import { Checkbox } from "@/components/ui/checkbox";

type UseProductColumnsProps = {
  handleDelete: (product: Product) => void;
  selectedProductIds: number[];
  currentPageProductIds: number[];
  onToggleProductSelection: (productId: number, isSelected: boolean) => void;
  onToggleCurrentPageSelection: (isSelected: boolean, pageIds: number[]) => void;
};

export function useProductColumns({
  handleDelete,
  selectedProductIds,
  currentPageProductIds,
  onToggleProductSelection,
  onToggleCurrentPageSelection,
}: UseProductColumnsProps): ColumnDef<Product>[] {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);

  return useMemo(
    () => [
      {
        id: "select",
        header: () => {
          const allSelected =
            currentPageProductIds.length > 0 &&
            currentPageProductIds.every((id) => selectedProductIds.includes(id));
          const partiallySelected =
            !allSelected && currentPageProductIds.some((id) => selectedProductIds.includes(id));

          return (
            <Checkbox
              aria-label={t("Select all")}
              checked={allSelected ? true : partiallySelected ? "indeterminate" : false}
              onCheckedChange={(value) => onToggleCurrentPageSelection(Boolean(value), currentPageProductIds)}
            />
          );
        },
        cell: ({ row }) => (
          <Checkbox
            aria-label={t("Select row")}
            checked={selectedProductIds.includes(row.original.id)}
            onCheckedChange={(value) => onToggleProductSelection(row.original.id, Boolean(value))}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        id: "image",
        header: t("Image"),
        cell: ({ row }) => (
          <div className="flex justify-center items-center w-20 h-20 overflow-hidden rounded-lg border border-gray-200">
            <img src={row.original.image} alt={row.original.name.en} className="object-cover w-full h-full" />
          </div>
        ),
      },
      {
        accessorKey: "barcode",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Barcode")} />,
        enableSorting: true,
      },
      {
        accessorKey: "name",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Name")} />,
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col space-y-1">
            {SUPPORTED_LANGS.map((lang) => (
              <div key={lang}>
                {lang.toUpperCase()}: <span>{row.original.name?.[lang]}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "category.name",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Category")} />,
        enableSorting: true,
        cell: ({ row }) => getText(row.original.category?.name, i18n.language),
      },
      {
        accessorKey: "brand.name",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Brand")} />,
        enableSorting: true,
        cell: ({ row }) => row.original.brand?.name || "-",
      },
      {
        accessorKey: "availability_status",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Status")} />,
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.availability_status;
          const statusColor = status === "available" ? "text-green-600" : "text-gray-500";
          return <span className={statusColor}>{t(`${status}`)}</span>;
        },
      },
      {
        accessorKey: "price",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Price")} />,
        enableSorting: true,
        cell: ({ row }) => (
          <span>{formatPrice(row.original.price * selectedCurrency.exchange_rate, selectedCurrency.code, i18n.language)}</span>
        ),
      },
      {
        accessorKey: "discount",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Discount")} />,
        enableSorting: true,
        cell: ({ row }) => {
          const discount = row.original.discount;
          return discount > 0 ? <span className="text-red-500">{discount}%</span> : <span className="text-gray-400">-</span>;
        },
      },
      {
        accessorKey: "coupon_eligible",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Coupon Eligible")} />,
        enableSorting: true,
        cell: ({ row }) => {
          const value = row.original.coupon_eligible;
          const isEligible = value === true || value === 1;

          return isEligible ? (
            <span className="text-green-600 font-medium">{t("Yes")}</span>
          ) : (
            <span className="text-gray-400">{t("No")}</span>
          );
        },
      },
      {
        accessorKey: "total_stock_quantity",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Quantity")} />,
        enableSorting: true,
        cell: ({ row }) => {
          const totalStock = row.original.total_stock_quantity ?? null;
          return totalStock !== null && totalStock !== undefined ? (
            <span>{totalStock}</span>
          ) : (
            <span className="text-gray-400">-</span>
          );
        },
      },
      {
        accessorKey: "arrangement",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Arrangement")} />,
        enableSorting: true,
        cell: ({ row }) => {
          const arrangement = row.original.arrangement;
          return arrangement !== null && arrangement !== undefined && arrangement !== "" ? (
            <span>{arrangement}</span>
          ) : (
            <span className="text-gray-400">-</span>
          );
        },
      },
      {
        accessorKey: "warranty",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Warranty")} />,
        enableSorting: true,
        cell: ({ row }) => {
          const warranty = row.original.warranty;
          return warranty && warranty.trim().length > 0 ? (
            <span>{warranty}</span>
          ) : (
            <span className="text-gray-400">-</span>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("Actions")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/products/${row.original.id}/edit`)}>
                {t("Edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600 focus:text-red-600">
                {t("Delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [
      currentPageProductIds,
      handleDelete,
      i18n.language,
      navigate,
      onToggleCurrentPageSelection,
      onToggleProductSelection,
      selectedCurrency,
      selectedProductIds,
      t,
    ]
  );
}
