import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    createProduct,
    deleteProductImage,
    deleteProductVariant,
    deleteVariantImage,
    generateBarcode,
    updateProduct,
    updateProductImage,
    updateVariantImage,
} from "@/lib/services/Products-services"
import { useSettings } from "@/hooks/usePublicData";
import { useProductById } from "./useProducts";
import { ProductFormValues } from "@/types/form.interfaces";
import { Variant } from "@/types/api.interfaces";
import { GetAllSettingsResponse } from "@/types/response.interfaces";

export function useProductFormLogic() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const isEdit = !!id;

    const { data: SettingsData, refetch: refetchSettings, isError: settingsError, isLoading: settingsLoading } = useSettings();

    useEffect(() => {
        if (settingsError) {
            toast.error(t("Failed to load settings. Availability options disabled until retry."));
        }
    }, [settingsError, t]);

    const tags = (SettingsData?.tags || []) as NonNullable<GetAllSettingsResponse["tags"]>;
    const categories = (SettingsData?.categories || []) as NonNullable<GetAllSettingsResponse["categories"]>;
    const brands = (SettingsData?.brands || []) as NonNullable<GetAllSettingsResponse["brands"]>;
    const colors = (SettingsData?.colors || []) as NonNullable<GetAllSettingsResponse["colors"]>;
    const sizes = (SettingsData?.sizes || []) as NonNullable<GetAllSettingsResponse["sizes"]>;
    const warehouses = (SettingsData?.warehouses || []) as NonNullable<GetAllSettingsResponse["warehouses"]>;
    const availabilityOptions = (SettingsData?.availability_statuses || []) as NonNullable<GetAllSettingsResponse["availability_statuses"]>;
    const availabilityDisabled = settingsLoading || settingsError || !availabilityOptions.length;

    const missingItems: string[] = [];
    if (!colors.length) missingItems.push(t("No colors available"));
    if (!sizes.length) missingItems.push(t("No sizes available"));
    if (!tags.length) missingItems.push(t("No tags available"));
    if (!categories.length) missingItems.push(t("No categories available"));
    if (!brands.length) missingItems.push(t("No brands available"));
    if (!warehouses.length) missingItems.push(t("No warehouses available"));

    const [confirmDialogProps, setConfirmDialogProps] = useState({
        open: false,
        onOpenChange: (open: boolean) =>
            setConfirmDialogProps((prev) => ({ ...prev, open })),
        handleConfirm: async () => { },
        isLoading: false,
        title: "",
        desc: "",
        cancelBtnText: t("Cancel"),
        confirmText: t("Confirm"),
        destructive: true,
    });

    const openConfirmDialog = ({
        title,
        desc,
        confirmText,
        cancelBtnText,
        destructive = true,
        onConfirm,
    }: {
        title?: string;
        desc?: string;
        confirmText?: string;
        cancelBtnText?: string;
        destructive?: boolean;
        onConfirm: () => Promise<void>;
    }) => {
        setConfirmDialogProps({
            open: true,
            onOpenChange: (open) => setConfirmDialogProps((prev) => ({ ...prev, open })),
            handleConfirm: async () => {
                setConfirmDialogProps((prev) => ({ ...prev, isLoading: true }));
                await onConfirm();
                setConfirmDialogProps((prev) => ({ ...prev, isLoading: false, open: false }));
            },
            isLoading: false,
            title: title || "",
            desc: desc || "",
            confirmText: confirmText || t("Confirm"),
            cancelBtnText: cancelBtnText || t("Cancel"),
            destructive,
        });
    };

    const { data: productData, refetch } = useProductById(Number(id));
    const [initialData, setInitialData] = useState<Partial<ProductFormValues>>();

    useEffect(() => {
        if (isEdit && productData?.product) {
            const product = productData.product;
            setInitialData({
                name: product.name,
                short_description: product.short_description,
                description: product.description,
                barcode: product.barcode,
                category_id: product.category?.id,
                brand_id: product.brand?.id,
                availability_status: product.availability_status as ProductFormValues["availability_status"],
                price: product.price,
                discount: product.discount,
                min_order_quantity: product.min_order_quantity,
                max_order_quantity: product.max_order_quantity,
                warranty: (product as any).warranty ?? null,
                coupon_eligible:
                    (product as any).coupon_eligible === null ||
                    typeof (product as any).coupon_eligible === "undefined"
                        ? null
                        : Boolean((product as any).coupon_eligible),
                images: product.images,
                tags: product.tags,
                variants: product.variants?.map((variant: Variant) => ({
                    id: variant.id,
                    color_id: variant.color?.id ?? null,
                    size_id: variant.size?.id ?? null,
                    price: variant.price ?? null,
                    discount: variant.discount ?? null,
                    images: variant.images || [],
                })),
                specifications: product.specifications,
            });
        }
    }, [productData, isEdit]);

    const handleSubmit = async (data: any) => {
        try {
            const formData = new FormData();

            const topAction = (data as any)?.__topAction as
                | "move_to_top"
                | "remove_from_top"
                | undefined;

            Object.entries(data.name || {}).forEach(([lang, value]) => {
                formData.append(`name[${lang}]`, String(value || ""));
            });

            Object.entries(data.description || {}).forEach(([lang, value]) => {
                formData.append(`description[${lang}]`, String(value || ""));
            });

            Object.entries(data.short_description || {}).forEach(([lang, value]) => {
                formData.append(`short_description[${lang}]`, String(value || ""));
            });

            formData.append("barcode", String(data.barcode || ""));
            formData.append("category_id", String(data.category_id || ""));
            formData.append("brand_id", String(data.brand_id || ""));
            formData.append("availability_status", String(data.availability_status || ""));
            formData.append("price", String(data.price || 0));
            formData.append("discount", String(data.discount || 0));
            formData.append("min_order_quantity", String(data.min_order_quantity || 0));
            formData.append("max_order_quantity", String(data.max_order_quantity || 0));
            formData.append("warranty", String(data.warranty || ""));
            if (typeof data.coupon_eligible !== "undefined" && data.coupon_eligible !== null) {
                formData.append("coupon_eligible", data.coupon_eligible ? "1" : "0");
            }

            if (isEdit) {
                if (topAction === "move_to_top") {
                    formData.append("move_to_top", "true");
                } else if (topAction === "remove_from_top") {
                    formData.append("remove_from_top", "true");
                }
            }

            (data.images || []).forEach((img: any, index: number) => {
                if (img?.image instanceof File) {
                    formData.append(`images[${index}][image]`, img.image);
                } else if (img?.image && typeof img.image === "string") {
                    formData.append(`images[${index}][image_url]`, String(img.image));
                }

                formData.append(`images[${index}][is_active]`, img?.is_active ? "1" : "0");
                formData.append(`images[${index}][arrangement]`, String(img?.arrangement ?? 0));
            });

            (data.tags || []).forEach((tag: any, index: number) => {
                formData.append(`tags[${index}]`, String(tag.id ?? tag));
            });

            if (!isEdit && (!data.variants || data.variants.length === 0)) {
                data.variants = [{ color_id: null, id: 0 }];
            }

            (data.variants || []).forEach((variant: any, index: number) => {
                formData.append(
                    `variants[${index}][color_id]`,
                    variant.color_id === null ? "" : String(variant.color_id || "")
                );
                formData.append(
                    `variants[${index}][size_id]`,
                    variant.size_id === null ? "" : String(variant.size_id || "")
                );

                if (variant.price !== null && variant.price !== undefined) {
                    formData.append(`variants[${index}][price]`, String(variant.price));
                }

                if (variant.discount !== null && variant.discount !== undefined) {
                    formData.append(`variants[${index}][discount]`, String(variant.discount));
                }

                if (variant.open_quantity !== null && variant.open_quantity !== undefined) {
                    formData.append(`variants[${index}][open_quantity]`, String(variant.open_quantity));
                }

                if (variant.warehouse_id !== null && variant.warehouse_id !== undefined) {
                    formData.append(`variants[${index}][warehouse_id]`, String(variant.warehouse_id));
                }

                if (variant.cost_per_item !== null && variant.cost_per_item !== undefined) {
                    formData.append(`variants[${index}][cost_per_item]`, String(variant.cost_per_item));
                }

                if (variant.id) {
                    formData.append(`variants[${index}][id]`, String(variant.id));

                    // Check if there are new images for this existing variant
                    if (data.existingVariantNewImages && data.existingVariantNewImages[variant.id]) {
                        const newImages = data.existingVariantNewImages[variant.id];
                        newImages.forEach((img: any, imgIndex: number) => {
                            if (img.image instanceof File) {
                                formData.append(`variants[${index}][new_images][${imgIndex}][image]`, img.image);
                                formData.append(`variants[${index}][new_images][${imgIndex}][is_active]`, img.is_active ? "1" : "0");
                                formData.append(`variants[${index}][new_images][${imgIndex}][arrangement]`, String(img.arrangement || imgIndex + 1));
                            }
                        });
                    }
                }

                // Add variant images (for new variants)
                if (!variant.id && variant.images && Array.isArray(variant.images)) {
                    variant.images.forEach((img: any, imgIndex: number) => {
                        if (img.image instanceof File) {
                            formData.append(`variants[${index}][images][${imgIndex}][image]`, img.image);
                            formData.append(`variants[${index}][images][${imgIndex}][is_active]`, img.is_active ? "1" : "0");
                            formData.append(`variants[${index}][images][${imgIndex}][arrangement]`, String(img.arrangement || imgIndex + 1));
                        }
                    });
                }

                // Add variant index for proper identification
                formData.append(`variants[${index}][index]`, String(index));
            });

            (data.specifications || []).forEach((spec: any, index: number) => {
                Object.entries(spec.description || {}).forEach(([lang, value]) => {
                    formData.append(
                        `specifications[${index}][description][${lang}]`,
                        String(value || "")
                    );
                });
            });

            const response = isEdit
                ? await updateProduct(Number(id), formData)
                : await createProduct(formData);

            if (response.result) {
                navigate("/products");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Submit failed"));
        }
    };

    const onExistingImageUpdate = async (
        productImageId: number,
        data: { arrangement: number; is_active?: boolean }
    ): Promise<{ result: boolean; message?: string }> => {
        return new Promise((resolve) => {
            openConfirmDialog({
                title: t("Update Image"),
                desc: t("Are you sure you want to update this image?"),
                destructive: false,
                onConfirm: async () => {
                    try {
                        const formData = new FormData();
                        formData.append("arrangement", String(data.arrangement));
                        if (typeof data.is_active !== "undefined") {
                            formData.append("is_active", data.is_active ? "1" : "0");
                        }
                        const response = await updateProductImage(productImageId, formData);

                        resolve({ result: response.result, message: response.message });
                    } catch (error: any) {
                        toast.error(error?.response?.data?.message || t("Update failed"));
                        resolve({ result: false, message: t("Update failed") });
                    }
                },
            });
        });
    };

    const onExistingImageDelete = async (productImageId: number) => {
        return new Promise<{ result: boolean; message?: string }>((resolve) => {
            openConfirmDialog({
                title: t("Delete Image"),
                desc: t("Are you sure you want to delete this image? This action cannot be undone."),
                onConfirm: async () => {
                    try {
                        const response = await deleteProductImage(productImageId);

                        resolve({ result: response.result, message: response.message });
                    } catch (error: any) {
                        toast.error(error?.response?.data?.message || t("Delete failed"));
                        resolve({ result: false, message: t("Delete failed") });
                    }
                },
            });
        });
    };

    const onExistingVariantDelete = async (variantId: number) => {
        return new Promise<{ result: boolean; message?: string }>((resolve) => {
            openConfirmDialog({
                title: t("Delete Variant"),
                desc: t("Are you sure you want to delete this variant? This action cannot be undone."),
                onConfirm: async () => {
                    try {
                        const response = await deleteProductVariant(variantId);

                        response.result && refetch()
                        resolve({ result: response.result, message: response.message });
                    } catch (error: any) {
                        toast.error(error?.response?.data?.message || t("Delete failed"));
                        resolve({ result: false, message: t("Delete failed") });
                    }
                },
            });
        });
    };

    const onExistingVariantImageUpdate = async (
        variantImageId: number,
        data: { arrangement: number; is_active?: boolean }
    ): Promise<{ result: boolean; message?: string }> => {
        return new Promise((resolve) => {
            openConfirmDialog({
                title: t("Update Variant Image"),
                desc: t("Are you sure you want to update this variant image?"),
                destructive: false,
                onConfirm: async () => {
                    try {
                        const formData = new FormData();
                        formData.append("arrangement", String(data.arrangement));
                        if (typeof data.is_active !== "undefined") {
                            formData.append("is_active", data.is_active ? "1" : "0");
                        }
                        const response = await updateVariantImage(variantImageId, formData);

                        resolve({ result: response.result, message: response.message });
                    } catch (error: any) {
                        toast.error(error?.response?.data?.message || t("Update failed"));
                        resolve({ result: false, message: t("Update failed") });
                    }
                },
            });
        });
    };

    const onExistingVariantImageDelete = async (variantImageId: number) => {
        return new Promise<{ result: boolean; message?: string }>((resolve) => {
            openConfirmDialog({
                title: t("Delete Variant Image"),
                desc: t("Are you sure you want to delete this variant image? This action cannot be undone."),
                onConfirm: async () => {
                    try {
                        const response = await deleteVariantImage(variantImageId);

                        resolve({ result: response.result, message: response.message });
                    } catch (error: any) {
                        toast.error(error?.response?.data?.message || t("Delete failed"));
                        resolve({ result: false, message: t("Delete failed") });
                    }
                },
            });
        });
    };

    const onGenerateBarcode = async (): Promise<string | null> => {
        try {
            const response = await generateBarcode();
            if (response.result && response.barcode) {
                return response.barcode;
            }
            toast.error(response.message || t("Barcode generation failed"));
            return null;
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Unexpected error during barcode generation"));
            return null;
        }
    };

    const handleCancel = () => {
        navigate("/products");
    };

    const categoryArrangements = Array.isArray(categories)
        ? categories
            .map((category) => category.arrangement)
            .filter((arrangement) => typeof arrangement !== "undefined")
            .map((arrangement) => String(arrangement))
        : [];

    return {
        messages: t,
        isEdit,
        initialData,
        rawProductData: productData?.product,
        colors,
        sizes,
        tags,
        categories,
        brands,
        categoryArrangements,
        warehouses,
        availabilityOptions,
        availabilityDisabled,
        missingItems,
        handleSubmit,
        handleCancel,
        onExistingImageUpdate,
        onExistingImageDelete,
        onExistingVariantDelete,
        onExistingVariantImageUpdate,
        onExistingVariantImageDelete,
        onGenerateBarcode,
        confirmDialogProps,
        refetchSettings,
    };
}