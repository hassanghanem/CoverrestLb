"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { SUPPORTED_LANGS } from "@/i18n";
import { Icons } from "@/components/public/icons";

export default function ProductSpecificationsInput() {
  const { t } = useTranslation();
  const { control, register } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications",
  });

  const createEmptyLangObject = () =>
    SUPPORTED_LANGS.reduce((acc, lang) => {
      acc[lang] = "";
      return acc;
    }, {} as Record<string, string>);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t("Specifications")}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 gap-4 p-4 rounded-lg border relative"
          >
            {SUPPORTED_LANGS.map((lang) => (
              <FormField
                key={`${index}-${lang}`}
                name={`specifications.${index}.description.${lang}`}
                render={() => (
                  <FormItem>
                    <FormLabel>
                      {t("Specification")} ({lang.toUpperCase()})
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...register(
                          `specifications.${index}.description.${lang}` as const
                        )}
                        dir={lang === "ar" ? "rtl" : "ltr"}
                        className={lang === "ar" ? "text-right" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <div className="flex items-end justify-end">
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:bg-red-50"
                onClick={() => remove(index)}
              >
                {t("Remove")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ description: createEmptyLangObject() })}
        >
          <Icons.add className="w-4 h-4 mr-1" />
          {t("Add specification")}
        </Button>
      </div>

    </div>
  );
}
