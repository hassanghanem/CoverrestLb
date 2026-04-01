import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation, Trans } from "react-i18next";

interface TablePaginationProps {
  currentPageSize: number;
  totalItems: number;
  visibleItems: number;
  onPageSizeChange: (size: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
  pageSizeOptions?: number[];
}

export function TablePagination({
  currentPageSize,
  totalItems,
  visibleItems,
  onPageSizeChange,
  onPreviousPage,
  onNextPage,
  canPreviousPage,
  canNextPage,
  pageSizeOptions = [10, 20, 30, 40, 50, 75],
}: TablePaginationProps) {
  const { t } = useTranslation();
  const [isAllSelected, setIsAllSelected] = useState(false);
  const selectValue = isAllSelected ? "all" : `${currentPageSize}`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      <div className="text-sm text-muted-foreground text-center sm:text-left">
        <Trans
          i18nKey="Showing {{visible}} of {{total}} results"
          values={{ visible: visibleItems, total: totalItems }}
          components={{ strong: <strong className="font-medium" /> }}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8 w-full sm:w-auto">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-normal">
          <p className="text-sm font-medium whitespace-nowrap">
            {t("Rows per page")}
          </p>
          <Select
            value={selectValue}
            onValueChange={(value) => {
              if (value === "all") {
                setIsAllSelected(true);
                onPageSizeChange(totalItems || currentPageSize);
              } else {
                setIsAllSelected(false);
                onPageSizeChange(Number(value));
              }
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={currentPageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
              <SelectItem key="all" value="all">
                {t("All")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-normal">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousPage}
            disabled={!canPreviousPage}
            className="flex-1 sm:flex-none"
          >
            {t("Previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={!canNextPage}
            className="flex-1 sm:flex-none"
          >
            {t("Next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
