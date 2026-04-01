import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "../ui/button";

export const TableHeaderSort = ({ column, title }: { column: any, title: string }) => {
    const sorted = column.getIsSorted();
    const isSortable = column.columnDef.enableSorting !== false;

    return (
        <Button
            variant="ghost"
            onClick={() => {
                if (isSortable) column.toggleSorting(sorted === "asc");
            }}
            className="-ml-3 hover:bg-transparent"
        >
            {title}
            {isSortable && (
                <span className="ml-2 flex items-center h-4 space-x-0.5">
                    <ArrowUp
                        className={`h-4 w-4 transition-colors ${sorted === "asc"
                                ? "text-foreground"
                                : "text-muted-foreground opacity-50"
                            }`}
                    />
                    <ArrowDown
                        className={`h-4 w-4 transition-colors ${sorted === "desc"
                                ? "text-foreground"
                                : "text-muted-foreground opacity-50"
                            }`}
                    />
                </span>
            )}
        </Button>
    );
};
