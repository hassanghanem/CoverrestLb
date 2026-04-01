import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export function TableSearch({
  value,
  onChange,
  onSearch,
  placeholder,
}: TableSearchProps) {
  const { t } = useTranslation();
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="relative max-w-sm flex-1">
      <Input
        placeholder={placeholder || t("Search...")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pr-10"
      />
      <Button
        variant="secondary"
        size="icon"
        className="absolute right-0 top-0 h-full px-3"
        onClick={onSearch}
        aria-label={t("Search")}
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}
