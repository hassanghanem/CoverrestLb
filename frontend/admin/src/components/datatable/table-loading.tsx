import { TableRow, TableCell } from "@/components/ui/table";
import { useTranslation } from "react-i18next";
import Spinner from "../public/spinner";

interface TableLoadingProps {
  colSpan: number;
  message?: string;
}

export function TableLoading({
  colSpan,
  message
}: TableLoadingProps) {
  const { t } = useTranslation();

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <Spinner />
          <span className="text-sm text-muted-foreground">
            {message || t("Loading")}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}
