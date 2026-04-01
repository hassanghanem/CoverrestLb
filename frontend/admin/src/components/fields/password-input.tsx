import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useTranslation } from "react-i18next";

const PasswordInput = ({ id, name, label }: { id: string; name: string; label: string }) => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor={id}>{t(label)}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                id={id}
                type={showPassword ? "text" : "password"}
                placeholder={t("Password")}
                {...field}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PasswordInput;
