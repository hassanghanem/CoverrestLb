import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Option {
  label: string;
  value: string | number;
}

interface MultiSelectProps {
  options: Option[];
  value: (string | number)[];
  onChange: (val: (string | number)[]) => void;
  placeholder?: string;
  className?: string;
  isModal?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  className,
  isModal = false,
}: MultiSelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const toggleValue = (val: string | number) => {
    onChange(
      value.includes(val)
        ? value.filter((v) => v !== val)
        : [...value, val]
    );
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={isModal}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between overflow-hidden", className)}
        >
          <span
            className={cn(
              "truncate overflow-hidden text-ellipsis whitespace-nowrap flex-1 text-left",
              value.length === 0 && "text-muted-foreground"
            )}
          >
            {selectedLabels.length > 0
              ? selectedLabels.join(", ")
              : placeholder ? t(placeholder) : t("Select...")}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-[300px] p-2 z-50 rounded-md border shadow-md bg-popover text-popover-foreground",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
          "max-h-80 overflow-hidden"
        )}
      >
        <Command loop className="w-full">
          <CommandInput
            ref={inputRef}
            placeholder={t("Search...")}
          />
          <ScrollArea className="max-h-60 pr-2">
            <CommandList>
              <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                {t("No results found")}
              </CommandEmpty>
              <CommandGroup className="space-y-1">
                {options.map((option) => {
                  const selected = value.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => toggleValue(option.value)}
                      className={cn(
                        "flex justify-between items-center mb-1.5 px-2 py-1.5 rounded-md text-sm cursor-pointer",
                        "hover:bg-accent hover:text-accent-foreground",
                        selected && "bg-accent text-accent-foreground"
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {selected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
