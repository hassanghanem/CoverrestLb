import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ImageUploadInputProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  existingImageUrl?: string;
}

export const ImageUploadInput = ({ form, name, label, existingImageUrl }: ImageUploadInputProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const isFile = value instanceof File;
        const previewUrl = isFile ? URL.createObjectURL(value) : value || existingImageUrl;

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                />
                {previewUrl && (
                  <div className="mt-2 relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-32 w-full object-contain border rounded"
                    />
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
