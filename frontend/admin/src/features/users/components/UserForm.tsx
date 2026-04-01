import {
  FormProvider,
  useForm,
} from "react-hook-form";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Role, Permission } from "@/types/api.interfaces";
import { Label } from "@/components/ui/label";
import { FormActions } from "@/components/fields/FormActions";
import PasswordInput from "@/components/fields/password-input";

type UserFormValues = {
  name: string;
  email: string;
  password?: string;
  role: string;
  permissions: string[];
};

interface UserFormProps {
  onSubmit: (data: UserFormValues) => void;
  onCancel: () => void;
  roles: Role[];
  permissions: Permission[];
  isEdit?: boolean;
  initialData?: Partial<UserFormValues>;
}

export const UserForm = ({
  onSubmit,
  onCancel,
  roles,
  permissions,
  isEdit,
  initialData,
}: UserFormProps) => {
  const { t } = useTranslation();

  const passwordSchema = z
    .string()
    .min(8, { message: t("Password must be at least 8 characters") })
    .regex(/[A-Z]/, { message: t("Password must contain at least one uppercase letter") })
    .regex(/[a-z]/, { message: t("Password must contain at least one lowercase letter") })
    .regex(/[0-9]/, { message: t("Password must contain at least one number") })
    .regex(/[^A-Za-z0-9]/, { message: t("Password must contain at least one special character") });

  const formSchema = z.object({
    name: z.string().min(1, t("Name is required")).max(255, t("Maximum 255 characters allowed")),
    email: z.string().email(t("Please enter a valid email address")),
    password: isEdit
      ? z.union([z.string().length(0), passwordSchema])
          .optional()
          .transform(val => val === "" ? undefined : val)
      : passwordSchema.optional(),
    role: z.string().min(1, t("Role is required")),
    permissions: z.array(z.string()),
  });

  const methods = useForm<UserFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      password: "",
      role: initialData?.role ?? "",
      permissions: initialData?.permissions ?? [],
    },
  });

  const { watch, setValue } = methods;
  const selectedPermissions = watch("permissions");
  const selectedRole = watch("role");

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col h-full space-y-4">
        {/* Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={methods.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Name")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Enter name")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={methods.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Email")}</FormLabel>
                <FormControl>
                  <Input type="email" {...field} placeholder={t("Enter email address")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Password & Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PasswordInput
            id="password"
            name="password"
            label={t("Password")}
          />
          <FormField
            control={methods.control}
            name="role"
            render={() => (
              <FormItem>
                <FormLabel>{t("Role")}</FormLabel>
                <FormControl className="w-full">
                  <Select
                    value={selectedRole}
                    onValueChange={(val) => setValue("role", val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("Select role")} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.name} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Permissions */}
        <FormField
          control={methods.control}
          name="permissions"
          render={() => {
            const [searchTerm, setSearchTerm] = useState("");

            const groupedPermissions = permissions.reduce((acc, perm) => {
              const [, resourceType] = perm.name.split("-");
              if (!acc[resourceType]) acc[resourceType] = [];
              acc[resourceType].push(perm);
              return acc;
            }, {} as Record<string, typeof permissions>);

            const handlePermissionChange = (permName: string, checked: boolean) => {
              const current = selectedPermissions || [];
              const [, resourceType] = permName.split("-");
              const viewPermission = `view-${resourceType}`;

              let newPermissions = [...current];

              if (checked) {
                newPermissions.push(permName);
                if (permName !== viewPermission && permissions.some(p => p.name === viewPermission)) {
                  newPermissions.push(viewPermission);
                }
              } else {
                newPermissions = newPermissions.filter(name => name !== permName);
                if (permName === viewPermission) {
                  newPermissions = newPermissions.filter(name => !name.endsWith(`-${resourceType}`));
                }
              }

              newPermissions = [...new Set(newPermissions)];
              setValue("permissions", newPermissions);
            };

            const filteredGrouped = Object.entries(groupedPermissions).filter(([resourceType]) =>
              resourceType.toLowerCase().includes(searchTerm.toLowerCase())
            );

            return (
              <FormItem className="flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <FormLabel className="text-lg font-semibold text-gray-800">{t("Permissions")}</FormLabel>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={permissions.every(p => selectedPermissions?.includes(p.name))}
                      onCheckedChange={(checked) => {
                        const allNames = permissions.map(p => p.name);
                        setValue("permissions", checked ? allNames : []);
                      }}
                    />
                    <Label htmlFor="select-all" className="text-sm text-gray-600">{t("Select All")}</Label>
                  </div>
                </div>

                <FormControl className="flex flex-col flex-1">
                  <div className="bg-white border rounded-xl shadow p-4 flex flex-col h-full">
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder={t("Search permissions...")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    {/* Scrollable permissions list */}
                    <ScrollArea className="flex-1 space-y-6 pr-2">
                      {filteredGrouped.length ? (
                        filteredGrouped.map(([resourceType, sectionPermissions]) => {
                          const allSelectedInSection = sectionPermissions.every(p =>
                            selectedPermissions?.includes(p.name)
                          );
                          const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

                          return (
                            <div key={resourceType} className="bg-gray-50 border border-gray-200 rounded-md p-4 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-700 capitalize">
                                  {t(resourceType) || capitalize(resourceType)}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`select-all-${resourceType}`}
                                    checked={allSelectedInSection}
                                    onCheckedChange={(checked) => {
                                      const names = sectionPermissions.map(p => p.name);
                                      const newPermissions = checked
                                        ? [...new Set([...(selectedPermissions || []), ...names])]
                                        : (selectedPermissions || []).filter(name => !names.includes(name));
                                      setValue("permissions", newPermissions);
                                    }}
                                  />
                                  <Label htmlFor={`select-all-${resourceType}`} className="text-xs text-gray-600">{t("Select All")}</Label>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {sectionPermissions
                                  .sort((a, b) => a.name.localeCompare(b.name))
                                  .map((perm) => (
                                    <div key={perm.id} className="flex items-center gap-3 hover:bg-white p-2 rounded-md">
                                      <Checkbox
                                        id={`perm-${perm.id}`}
                                        checked={selectedPermissions?.includes(perm.name)}
                                        onCheckedChange={(checked) =>
                                          handlePermissionChange(perm.name, !!checked)
                                        }
                                      />
                                      <Label htmlFor={`perm-${perm.id}`} className="text-sm text-gray-800 capitalize">
                                        {t(perm.name.split("-")[0])}
                                      </Label>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          {t("No permissions found")}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormActions
          onCancel={onCancel}
          isSubmitting={methods.formState.isSubmitting}
          cancelLabel={t("Cancel")}
          submitLabel={isEdit ? t("Update") : t("Create")}
          submitingLabel={isEdit ? t("Updating...") : t("Creating...")}
        />
      </form>
    </FormProvider>
  );
};
