import { useEffect } from "react";
import {
    useFieldArray,
    useFormContext,
    UseFormReturn,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { Banner } from "@/types/api.interfaces";
import { X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_LANGS } from "@/i18n";
import { ImageUploadInput } from "@/components/fields/ImageUploadInput";

interface BannerFieldsProps {
    methods: UseFormReturn<any>;
    initialBanners?: Banner[] | null;
    onExistingBannerDelete: (
        bannerId: number
    ) => Promise<{ result: boolean; message?: string }>;
}

type BannerWithMeta = {
    id?: number;
    home_section_id?: number;
    title: Record<string, string>;
    subtitle: Record<string, string>;
    image: File | string | null;
    image_mobile: File | string | null;
    link: string;
    arrangement: string;
    isNew: boolean;
    is_active: boolean;
};

export const BannerFields = ({
    methods,
    initialBanners,
    onExistingBannerDelete,
}: BannerFieldsProps) => {
    const { t } = useTranslation();
    const { control, formState, watch } = methods;
    const form = useFormContext();
    const {
        fields,
        append,
        remove,
        update,
        replace, move
    } = useFieldArray<{ banners: BannerWithMeta[] }>({
        control,
        name: "banners",
    });

    useEffect(() => {
        if (initialBanners) {
            const formatted: BannerWithMeta[] = initialBanners.map((b, i) => ({
                id: b.id,
                home_section_id: b.home_section_id,
                title: b.title ?? SUPPORTED_LANGS.reduce((acc, lang) => {
                    acc[lang] = "";
                    return acc;
                }, {} as Record<string, string>),
                subtitle: b.subtitle ?? SUPPORTED_LANGS.reduce((acc, lang) => {
                    acc[lang] = "";
                    return acc;
                }, {} as Record<string, string>),
                image: b.image ?? "",
                image_mobile: b.image_mobile ?? "",
                link: b.link ?? "",
                arrangement: String(i + 1),
                isNew: false,
                is_active: Boolean(b.is_active ?? true),
            }));
            replace(formatted);
        }
    }, [initialBanners, replace]);

    const addNewBanner = () => {
        append({
            title: SUPPORTED_LANGS.reduce((acc, lang) => {
                acc[lang] = "";
                return acc;
            }, {} as Record<string, string>),
            subtitle: SUPPORTED_LANGS.reduce((acc, lang) => {
                acc[lang] = "";
                return acc;
            }, {} as Record<string, string>),
            image: null,
            image_mobile: null,
            link: "",
            arrangement: String(fields.length + 1),
            isNew: true,
            is_active: true,
        });
    };

    const handleDelete = async (index: number) => {
        const current = fields[index];

        if (!current.isNew && current.id && onExistingBannerDelete) {
            const res = await onExistingBannerDelete(current.id);
            if (!res?.result) return;
        }

        const removedArrangement = parseInt(current.arrangement);
        remove(index);

        const updatedBanners = [...fields].filter((_, i) => i !== index);
        const reorderedBanners = updatedBanners.map(banner => {
            const currentArrangement = parseInt(banner.arrangement);
            if (currentArrangement > removedArrangement) {
                return { ...banner, arrangement: String(currentArrangement - 1) };
            }
            return banner;
        });

        replace(reorderedBanners);
    };

    const bannersWatch = watch("banners") || [];
    const handleArrangementChange = (index: number, newVal: string) => {
        const updated = bannersWatch.map((banner: any) => ({ ...banner }));
        const current = updated[index];
        const newIndex = parseInt(newVal) - 1;
        const swapIndex = updated.findIndex(
            (b: { arrangement: string }, i: number) => b.arrangement === newVal && i !== index
        );

        if (swapIndex !== -1) {
            updated[swapIndex] = { ...updated[swapIndex], arrangement: current.arrangement };
            updated[index] = { ...current, arrangement: newVal };
        } else {
            updated[index] = { ...current, arrangement: newVal };
        }

        move(index, newIndex);

        setTimeout(() => {
            const currentBanners = watch("banners") || [];
            const updated = currentBanners.map((banner: BannerWithMeta, i: number) => ({
                ...banner,
                arrangement: String(i + 1),
            }));
            replace(updated);
        }, 0);
    };

    const handleIsActiveChange = (index: number, value: boolean) => {
        const updated = [...bannersWatch];
        updated[index] = { ...updated[index], is_active: value };
        update(index, updated[index]);
    };
    return (
        <div className="space-y-4">
            <Label>{t("Banners")}</Label>

            {formState.errors?.banners?.root && (
                <p className="text-red-600 text-sm mb-2">
                    {String(formState.errors.banners.root.message)}
                </p>
            )}

            {fields.map((banner, index) => (
                <div
                    key={`banner-${banner.id ?? index}-${banner.arrangement}`}
                    className="relative pt-10 p-6 border rounded-2xl shadow-sm bg-background space-y-4"
                >
                    {banner.isNew && (
                        <Badge className="absolute top-3 left-3 bg-blue-500 text-white">
                            {t("New")}
                        </Badge>
                    )}

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(index)}
                        className="absolute top-2 right-2 hover:bg-destructive/10"
                    >
                        <X className="w-5 h-5 text-destructive" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SUPPORTED_LANGS.map((lang) => (
                            <FormField
                                key={`title-${lang}-${index}`}
                                control={control}
                                name={`banners.${index}.title.${lang}`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Title")} ({lang.toLocaleUpperCase()})</FormLabel>
                                        <FormControl>
                                            <Input {...field} dir={lang === "ar" ? "rtl" : "ltr"} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}

                        {SUPPORTED_LANGS.map((lang) => (
                            <FormField
                                key={`subtitle-${lang}-${index}`}
                                control={control}
                                name={`banners.${index}.subtitle.${lang}`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Subtitle")} ({lang.toLocaleUpperCase()})</FormLabel>
                                        <FormControl>
                                            <Input {...field} dir={lang === "ar" ? "rtl" : "ltr"} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}

                        <FormField
                            control={control}
                            name={`banners.${index}.link`}
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>{t("Link")}</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <ImageUploadInput
                        form={form}
                        name={`banners.${index}.image`}
                        label={t("Desktop Image")}
                        existingImageUrl={typeof banner.image === "string" && !banner.isNew ? banner.image : undefined}
                    />

                    <ImageUploadInput
                        form={form}
                        name={`banners.${index}.image_mobile`}
                        label={t("Mobile Image")}
                        existingImageUrl={typeof banner.image_mobile === "string" && !banner.isNew ? banner.image_mobile : undefined}
                    />


                    <div className="flex flex-col md:flex-row gap-4">
                        <FormItem className="w-full md:w-1/2">
                            <FormLabel>{t("Arrangement")}</FormLabel>
                            <Select
                                value={bannersWatch[index]?.arrangement ?? ""}
                                onValueChange={(val) => { handleArrangementChange(index, val); return false; }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("Select arrangement")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {fields.map((_, i) => (
                                        <SelectItem key={i} value={String(i + 1)}>
                                            {i + 1}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>

                        <FormItem className="w-full md:w-1/2">
                            <FormLabel>{t("Status")}</FormLabel>
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={bannersWatch[index]?.is_active}
                                    onCheckedChange={(val) => handleIsActiveChange(index, val)}
                                />
                                <span className="text-sm text-muted-foreground">
                                    {bannersWatch[index]?.is_active ? t("Active") : t("Inactive")}
                                </span>
                            </div>
                        </FormItem>
                    </div>
                </div>
            ))}

            <Button type="button" variant="outline" onClick={addNewBanner}>
                {t("Add Banner")}
            </Button>
        </div>
    );
};
