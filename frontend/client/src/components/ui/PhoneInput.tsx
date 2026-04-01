"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { getCountries, getCountryCallingCode, CountryCode } from "libphonenumber-js";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Check } from "lucide-react";
import { usePhoneLogic } from "@/hooks/usePhoneLogic";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

type CountryOption = {
  code: CountryCode;
  name: string;
  dialCode: string;
};

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: CountryCode;
  placeholder?: string;
  className?: string;
  disableFormatting?: boolean; // New prop to disable automatic international formatting
}

export function PhoneInput({
  className,
  value,
  onChange,
  defaultCountry = "LB",
  placeholder,
  disableFormatting = false,
}: PhoneInputProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [country, setCountry] = React.useState<CountryCode>(defaultCountry);
  const [phoneValue, setPhoneValue] = React.useState(value || "");

  // Use centralized phone logic for formatting
  const { formatPhoneForForm, extractPhoneNumber } = usePhoneLogic();

  const countries: CountryOption[] = React.useMemo(() => {
    return getCountries()
      .map((code) => ({
        code,
        name: new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code,
        dialCode: `+${getCountryCallingCode(code)}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const selectedCountry = countries.find((c) => c.code === country);

  // Update phone value when external value changes
  React.useEffect(() => {
    if (value && value !== phoneValue) {
      // Extract national number from international format for display
      const nationalNumber = extractPhoneNumber(value);
      setPhoneValue(nationalNumber);
    } else if (!value && phoneValue) {
      setPhoneValue("");
    }
  }, [value, phoneValue, extractPhoneNumber]);

  // Update country when external defaultCountry changes
  React.useEffect(() => {
    if (defaultCountry !== country) {
      setCountry(defaultCountry);
    }
  }, [defaultCountry, country]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Remove any country code that might have been typed
    const cleanValue = rawValue.replace(/^\+\d{1,4}\s*/, '');
    setPhoneValue(cleanValue);

    if (onChange) {
      if (disableFormatting) {
        // Just pass the clean value without formatting
        onChange(cleanValue);
      } else {
        // Use centralized formatting logic with the selected country
        const formattedPhone = formatPhoneForForm(cleanValue, country);
        onChange(formattedPhone);
      }
    }
  };

  const handleCountryChange = (code: CountryCode) => {
    setCountry(code);
    setOpen(false);
    
    // Re-format current phone value with new country
    if (phoneValue && onChange) {
      if (disableFormatting) {
        // Don't reformat when formatting is disabled
        onChange(phoneValue);
      } else {
        // Format with new country but keep the input field showing only national number
        const formattedPhone = formatPhoneForForm(phoneValue, code);
        onChange(formattedPhone);
      }
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Combined input */}
      <Input
        type="tel"
        placeholder={placeholder ? t(placeholder) : t("Phone number")}
        value={phoneValue}
        onChange={handleInputChange}
        className="pl-20" // padding for the dropdown inside input
      />

      {/* Country selector inside input */}
      <div className="absolute left-0 top-0 h-full flex items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-full w-[50px] rounded-r-none border-r-0 flex items-center justify-between pl-2 pr-1 text-sm"
            >
              <span>{selectedCountry?.dialCode}</span>
              <ChevronsUpDown className="ml-1 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder={t("Search country...")} />
              <CommandList>
                <CommandEmpty>{t("No country found.")}</CommandEmpty>
                <CommandGroup>
                  {countries.map((c) => (
                    <CommandItem
                      key={c.code}
                      onSelect={() => handleCountryChange(c.code)}
                      value={c.name}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          c.code === country ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {c.name} ({c.dialCode})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
