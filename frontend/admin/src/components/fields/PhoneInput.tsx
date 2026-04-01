"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  CountryCode,
} from "libphonenumber-js";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Check } from "lucide-react";
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
}

export function PhoneInput({
  className,
  value,
  onChange,
  defaultCountry = "LB",
  placeholder,
}: PhoneInputProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [country, setCountry] = React.useState<CountryCode>(defaultCountry);
  const [phoneValue, setPhoneValue] = React.useState("");

  const countries: CountryOption[] = React.useMemo(() => {
    return getCountries()
      .map((code) => ({
        code,
        name: new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code,
        dialCode: `+${getCountryCallingCode(code)}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const selectedCountry = React.useMemo(
    () => countries.find((c) => c.code === country),
    [countries, country]
  );


  React.useEffect(() => {
    if (!value) {
      setPhoneValue("");
      return;
    }

    const parsed = parsePhoneNumberFromString(value);
    if (parsed) {
      setCountry(parsed.country || defaultCountry);
      setPhoneValue(parsed.nationalNumber);
    } else {

      const digits = value.replace(/\D/g, "");
      const callingCode = getCountryCallingCode(country);
      setPhoneValue(digits.startsWith(callingCode) ? digits.slice(callingCode.length) : digits);
    }

  }, [value, defaultCountry]);

  const emitFullNumber = React.useCallback(
    (cc: CountryCode, nationalDigits: string) => {
      if (!onChange) return;

      if (!nationalDigits) {
        onChange("");
        return;
      }

      const callingCode = getCountryCallingCode(cc);
      const fullNumber = `+${callingCode}${nationalDigits}`;
      const parsed = parsePhoneNumberFromString(fullNumber);

      // ✅ Only save when VALID
      if (parsed && parsed.isValid()) {
        onChange(parsed.number); // normalized E.164
      } else {
        onChange(""); // ❌ don't save invalid/too short numbers like 717376
      }
    },
    [onChange]
  );


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    let digits = e.target.value.replace(/\D/g, "");


    const callingCode = getCountryCallingCode(country);


    if (digits.startsWith("00")) digits = digits.slice(2);


    if (digits.startsWith(callingCode)) {
      digits = digits.slice(callingCode.length);
    }

    setPhoneValue(digits);
    emitFullNumber(country, digits);
  };

  const handleCountryChange = (code: CountryCode) => {
    setCountry(code);
    setOpen(false);


    if (phoneValue) {
      emitFullNumber(code, phoneValue);
    } else if (onChange) {
      onChange("");
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "flex h-10 w-full items-center overflow-hidden rounded-md border border-input bg-background",
          "focus-within:ring-1 focus-within:ring-ring"
        )}
      >
        {/* Country selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "h-full rounded-none border-r border-input px-2 text-sm",
                "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <span className="tabular-nums">{selectedCountry?.dialCode}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[280px] p-0" align="start">
            <Command>
              <CommandInput placeholder={t("Search country...")} />
              <CommandList>
                <CommandEmpty>{t("No country found.")}</CommandEmpty>
                <CommandGroup>
                  {countries.map((c) => (
                    <CommandItem
                      key={c.code}
                      value={c.name}
                      onSelect={() => handleCountryChange(c.code)}
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

        {/* Phone input */}
        <Input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={placeholder ? t(placeholder) : t("Phone number")}
          value={phoneValue}
          onChange={handleInputChange}
          className={cn(
            "h-full flex-1 border-0 bg-transparent",
            "focus-visible:ring-0 focus-visible:ring-offset-0"
          )}
        />
      </div>
    </div>
  );
}