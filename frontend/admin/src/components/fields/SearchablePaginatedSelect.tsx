import { useState, useEffect, useRef, useCallback } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
} from "@radix-ui/react-popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PaginatedData } from "@/types/api.interfaces";

interface SearchablePaginatedSelectProps<T> {
  placeholder?: string;
  fetchData: (searchTerm: string) => PaginatedData<T>;
  idKey?: keyof T;
  labelKey?: keyof T;
  field: {
    value: string | number | undefined;
    onChange: (value: string | number, option?: T) => void;
  };
  className?: string;
  isModal?: boolean;
  initialValue?: T; // Add this to pre-populate cache
}

export function SearchablePaginatedSelect<T>({
  placeholder,
  fetchData,
  idKey = "id" as keyof T,
  labelKey = "label" as keyof T,
  field,
  className,
  isModal = false,
  initialValue, // Add this parameter
}: SearchablePaginatedSelectProps<T>) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { ref: loadMoreRef, inView } = useInView();
  const itemsCacheRef = useRef<Map<string | number, T>>(new Map());

  // Pre-populate cache with initial value if provided
  useEffect(() => {
    if (initialValue && field.value) {
      itemsCacheRef.current.set(String(field.value), initialValue);
    }
  }, [initialValue, field.value]);

  useEffect(() => {
    const handler = debounce((val: string) => setDebouncedTerm(val), 300);
    handler(searchTerm);
    return () => handler.cancel();
  }, [searchTerm]);

  const paginatedData = fetchData(debouncedTerm);
  const allOptions = paginatedData.items;

  // Update cache with newly loaded items
  useEffect(() => {
    allOptions.forEach((item) => {
      itemsCacheRef.current.set(String(item[idKey as keyof T]), item);
    });
  }, [allOptions, idKey]);

  // Find selected option from current options, or from cache if not in current view
  const selectedOption = allOptions.find(
    (opt) => String(opt[idKey]) === String(field.value)
  ) || itemsCacheRef.current.get(String(field.value));

  useEffect(() => {
    if (
      inView &&
      paginatedData.hasNextPage &&
      !paginatedData.isFetchingNextPage &&
      !paginatedData.isError
    ) {
      paginatedData.fetchNextPage();
    }
  }, [inView, paginatedData]);

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  const handleSelect = useCallback(
    (option: T) => {
      field.onChange(option[idKey] as string | number, option);
      setOpen(false);
      setSearchTerm("");
    },
    [field, idKey]
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={isModal}>
      <PopoverTrigger asChild className="w-full">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full max-w-full sm:max-w-[320px] min-w-0 justify-between mt-1",
            className
          )}
        >
          <span
            className={cn(
              "truncate text-left",
              !selectedOption && "text-muted-foreground"
            )}
          >
            {selectedOption
              ? String(selectedOption[labelKey])
              : placeholder ?? t("Select")}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverPortal>
        <PopoverContent
          sideOffset={4}
          align="start"
          className={cn(
            "w-[300px] max-h-[400px] p-2 rounded-md border shadow-md bg-popover text-popover-foreground overflow-hidden z-100",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
          )}
          onOpenAutoFocus={(e: Event) => e.preventDefault()}
        >
          <Command loop shouldFilter={false} className="w-full">
            <CommandInput
              ref={inputRef}
              placeholder={t("Search")}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <ScrollArea className="max-h-[300px]">
              <CommandList>
                <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                  {t("No results")}
                </CommandEmpty>
                <CommandGroup className="space-y-1">
                  {paginatedData.isLoading && (
                    <div className="flex justify-center p-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                  {!paginatedData.isLoading &&
                    allOptions.map((option) => {
                      const isSelected =
                        String(option[idKey]) === String(field.value);

                      return (
                        <CommandItem
                          key={String(option[idKey])}
                          value={String(option[labelKey])}
                          onSelect={() => handleSelect(option)}
                          className={cn(
                            "mb-1.5 px-2 py-1.5 rounded-md text-sm cursor-pointer",
                            "hover:bg-accent hover:text-accent-foreground",
                            isSelected && "bg-accent text-accent-foreground",
                            "wrap-break-word"
                          )}
                        >
                          <div className="flex w-full items-center justify-between gap-2">
                            <span className="block max-w-full whitespace-normal wrap-break-word">
                              {String(option[labelKey])}
                            </span>
                            {isSelected && (
                              <Check className="h-4 w-4 shrink-0" />
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  {paginatedData.hasNextPage && (
                    <div ref={loadMoreRef} className="flex justify-center p-2">
                      {paginatedData.isFetchingNextPage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            paginatedData.fetchNextPage();
                          }}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          {t("Load more")}
                        </button>
                      )}
                    </div>
                  )}
                </CommandGroup>
              </CommandList>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
}
