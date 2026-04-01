import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import { FormActions } from "@/components/fields/FormActions";

type BrandFormValues = {
  name: string;
};

// Define the schema outside the component
const createFormSchema = (t: (key: string) => string) => {
  return z.object({
    name: z.string().min(1, t("Name is required")).max(100, t("Maximum 100 characters allowed")),
  });
};

interface BrandFormProps {
  onSubmit: (data: z.infer<ReturnType<typeof createFormSchema>>) => void;
  onCancel: () => void;
  isEdit?: boolean;
  initialData?: Partial<BrandFormValues>;
}

export const BrandForm = ({
  onSubmit,
  onCancel,
  isEdit = false,
  initialData,
}: BrandFormProps) => {
  const { t } = useTranslation();
  const formSchema = createFormSchema(t);
  type FormValues = z.infer<typeof formSchema>;

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={methods.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Name")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormActions
          onCancel={onCancel}
          isSubmitting={methods.formState.isSubmitting}
          cancelLabel={t("Cancel")}
          submitLabel={isEdit ? t("Update") : t("Create")}
          submitingLabel={isEdit ? t("Updating") : t("Creating")}
        />
      </form>
    </FormProvider>
  );
};
