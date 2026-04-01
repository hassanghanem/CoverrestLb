import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface BarcodeInputProps {
  name?: string;
  onGenerateBarcode: () => Promise<string | null>;
  autoGenerateIfEmpty?: boolean;
}

export default function BarcodeInput({
  name = "barcode",
  onGenerateBarcode,
  autoGenerateIfEmpty = false,
}: BarcodeInputProps) {
  const methods = useFormContext();
  const { t } = useTranslation();

  const handleGenerate = async () => {
    const generated = await onGenerateBarcode();
    if (generated) {
      methods.setValue(name, generated, { shouldValidate: true, shouldDirty: true });
    }
  };

  useEffect(() => {
    if (!autoGenerateIfEmpty) return;

    const current = methods.getValues(name);
    if (!current) {
      (async () => {
        const generated = await onGenerateBarcode();
        if (generated) {
          methods.setValue(name, generated, { shouldValidate: true, shouldDirty: true });
        }
      })();
    }
  }, [autoGenerateIfEmpty, methods, name, onGenerateBarcode]);

  return (
    <FormField
      control={methods.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Barcode")}</FormLabel>

          <FormControl>
            {/* ✅ One combined control: button stays INSIDE, no absolute positioning */}
            <div
              className={cn(
                "flex h-10 w-full items-center overflow-hidden rounded-md border border-input bg-background",
                "focus-within:ring-1 focus-within:ring-ring"
              )}
            >
              <Input
                {...field}
                className={cn(
                  "h-full flex-1 border-0 bg-transparent",
                  "focus-visible:ring-0 focus-visible:ring-offset-0"
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                className={cn(
                  "h-full rounded-none border-l border-input px-3",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("Generate")}
              </Button>
            </div>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
