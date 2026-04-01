"use client";

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";

interface ProductImagesInputProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  existingImages?: {
    id: number;
    url: string;
    arrangement: number;
    is_active?: boolean;
  }[];
  onExistingImageUpdate: (
    productImageId: number,
    data: { arrangement: number; is_active?: boolean }
  ) => Promise<{ result: boolean; message?: string }>;
  onExistingImageDelete: (
    productImageId: number
  ) => Promise<{ result: boolean; message?: string }>;
}

type ImageWithMeta =
  | {
    id: number;
    url: string;
    arrangement: number;
    isNew: false;
    is_active: boolean;
  }
  | {
    file: File;
    url: string;
    arrangement: number;
    isNew: true;
    is_active: boolean;
  };

export const ProductImagesInput = ({
  form,
  name,
  label,
  existingImages = [],
  onExistingImageUpdate,
  onExistingImageDelete,
}: ProductImagesInputProps) => {
  const { t } = useTranslation();
  const [images, setImages] = useState<ImageWithMeta[]>([]);

  // Create a unique ID for this component instance
  const componentId = `file-input-${name.replace(/\./g, '-')}`;

  useEffect(() => {
    // Existing images from API
    const syncedExisting: ImageWithMeta[] = existingImages.map((img) => ({
      id: img.id,
      url: img.url,
      arrangement: img.arrangement,
      isNew: false,
      is_active: img.is_active ?? true,
    }));

    // New images already present in form state (ex: from bulk generator append)
    const currentFormValue = form.getValues(name) || [];
    const syncedNew: ImageWithMeta[] = (Array.isArray(currentFormValue) ? currentFormValue : [])
      .filter((x: any) => x?.image instanceof File)
      .map((x: any, i: number) => ({
        file: x.image as File,
        url: URL.createObjectURL(x.image as File),
        arrangement:
          typeof x.arrangement === "number"
            ? x.arrangement
            : syncedExisting.length + i + 1,
        isNew: true,
        is_active: typeof x.is_active === "boolean" ? x.is_active : true,
      }));

    // Merge: existing + new
    const merged = [...syncedExisting, ...syncedNew];

    setImages(merged);

    // IMPORTANT: don't wipe form values if there are already new images there
    updateFormImages(merged, false);

    // Cleanup blob urls to avoid memory leaks
    return () => {
      syncedNew.forEach((img) => {
        if (img.isNew) URL.revokeObjectURL(img.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(existingImages), name]);


  const updateFormImages = (updated: ImageWithMeta[], shouldValidate: boolean = true) => {
    const sorted = [...updated].sort((a, b) => a.arrangement - b.arrangement);
    const newImagesOnly = sorted.filter((img) => img.isNew);

    const formValue = newImagesOnly.map((img) => ({
      image: img.file,
      is_active: img.is_active,
      arrangement: img.arrangement,
    }));

    form.setValue(name, formValue, { shouldValidate });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addNewImages(files);
  };

  const addNewImages = (files: File[]) => {
    const newImages: ImageWithMeta[] = files.map((file, i) => ({
      file,
      url: URL.createObjectURL(file),
      arrangement: images.length + i + 1,
      isNew: true,
      is_active: true,
    }));

    const updated = [...images, ...newImages];
    setImages(updated);
    updateFormImages(updated);
  };

  const handleDelete = async (index: number) => {
    const target = images[index];
    if (!target.isNew && onExistingImageDelete) {
      try {
        const response = await onExistingImageDelete(target.id);
        if (!response?.result) return;
      } catch { }
    }

    const updated = [...images];
    updated.splice(index, 1);
    updated.forEach((img, i) => (img.arrangement = i + 1));
    setImages(updated);
    updateFormImages(updated);
  };

  const handleArrangementChange = async (index: number, newArrangement: number) => {
    const current = images[index];

    // For new images, update immediately
    if (current.isNew) {
      const updated = [...images];
      const swapIndex = updated.findIndex(
        (img, i) => img.arrangement === newArrangement && i !== index
      );
      if (swapIndex !== -1) updated[swapIndex].arrangement = current.arrangement;
      updated[index].arrangement = newArrangement;
      setImages(updated);
      updateFormImages(updated);
      return;
    }

    // For existing images, only update UI after API success
    if (onExistingImageUpdate) {
      try {
        const response = await onExistingImageUpdate(current.id, {
          arrangement: newArrangement,
          is_active: current.is_active,
        });

        // Only update state if API call succeeds
        if (response?.result) {
          const updated = [...images];
          const swapIndex = updated.findIndex(
            (img, i) => img.arrangement === newArrangement && i !== index
          );
          if (swapIndex !== -1) updated[swapIndex].arrangement = current.arrangement;
          updated[index].arrangement = newArrangement;
          setImages(updated);
          updateFormImages(updated);
        }
        // If API fails or user cancels, do nothing - dropdown will stay at original value
      } catch {
        // If API call fails, do nothing - dropdown will stay at original value
      }
    }
  };

  const handleIsActiveChange = async (index: number, value: boolean) => {
    const current = images[index];
    if (!current.isNew && onExistingImageUpdate) {
      try {
        const response = await onExistingImageUpdate(current.id, {
          arrangement: current.arrangement,
          is_active: value,
        });
        if (!response?.result) return;
      } catch { }
    }
    const updated = [...images];
    updated[index].is_active = value;
    setImages(updated);
    updateFormImages(updated);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{t(label)}</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <Input
                id={componentId}
                type="file"
                multiple
                accept=".jpeg,.jpg,.png,.gif"
                onChange={handleFileChange}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-2">
                {images.map((img, index) => (
                  <div
                    key={img.url + "-" + index}
                    className="relative border rounded p-3 flex flex-col gap-3"
                  >
                    <div className="relative w-full aspect-square bg-muted rounded overflow-hidden">
                      <img
                        src={img.url}
                        alt={`${t("Image")} ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                      {img.isNew && (
                        <Badge className="absolute top-2 left-2 bg-blue-500 text-white text-xs">
                          {t("New")}
                        </Badge>
                      )}
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(index)}
                        className="absolute top-2 right-2 h-7 w-7"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium whitespace-nowrap">{t("Order")}:</span>
                        <Select
                          value={String(img.arrangement)}
                          onValueChange={(value) =>
                            handleArrangementChange(index, Number(value))
                          }
                        >
                          <SelectTrigger className="h-8 flex-1">
                            <SelectValue placeholder={t("Arrangement")} />
                          </SelectTrigger>
                          <SelectContent>
                            {images.map((_, i) => (
                              <SelectItem key={i} value={String(i + 1)}>
                                {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium">{t("Status")}:</span>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={img.is_active}
                            onCheckedChange={(checked) =>
                              handleIsActiveChange(index, Boolean(checked))
                            }
                          />
                          <span className="text-xs whitespace-nowrap">
                            {img.is_active ? t("Active") : t("Inactive")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
