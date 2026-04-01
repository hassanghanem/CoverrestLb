import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    createHomeSection,
    deleteBanner,
    updateHomeSection,
} from "@/lib/services/HomeSections-services";
import { useHomeSectionById, useHomeSections } from "./useHomeSections";
import { Banner, HomeSection, PaginatedData, ProductSectionItem } from "@/types/api.interfaces";
import { useAllProducts } from "@/hooks/usePublicData";
import { HomeSectionFormValues } from "@/types/form.interfaces";

export function useHomeSectionFormLogic() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const isEdit = !!id;

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

    const { data: HomeSectionData } = useHomeSectionById(Number(id));
    const [initialData, setInitialData] = useState<Partial<HomeSectionFormValues>>();
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
    useEffect(() => {
        if (isEdit && HomeSectionData?.home_section) {
            const HomeSection = HomeSectionData.home_section;
            setInitialData({
                type: HomeSection?.type || "banner",
                title: HomeSection?.title,
                arrangement: HomeSection?.arrangement?.toString() ?? "0",
                banners: HomeSection?.banners?.map((banner: Banner) => ({
                    id: banner.id,
                    home_section_id: banner.home_section_id,
                    image: banner.image,
                    image_mobile: banner.image_mobile,
                    link: banner.link ?? "",
                    title: banner.title ?? "",
                    subtitle: banner.subtitle ?? "",
                    arrangement: banner.arrangement?.toString() ?? "0",
                    is_active: banner.is_active,
                })) ?? [],
                product_section_items: HomeSection?.product_section_items?.map((item: ProductSectionItem) => ({
                    id: item.id,
                    product_id: item.product_id,
                    home_section_id: item.home_section_id,
                    arrangement: item.arrangement?.toString() ?? "0",
                    is_active: item.is_active,
                    product: item.product,
                })) ?? [],
            });
        }
    }, [HomeSectionData, isEdit]);

    const handleSubmit = async (data: HomeSectionFormValues) => {
        try {
            const formData = new FormData();
            formData.append('type', data.type);

            // Use the same pattern for title as category form
            Object.entries(data.title).forEach(([lang, value]) => {
                formData.append(`title[${lang}]`, value || '');
            });

            if (typeof data.is_active !== 'undefined') {
                formData.append('is_active', data.is_active ? '1' : '0');
            }

            if (data.arrangement) {
                formData.append('arrangement', String(data.arrangement));
            }

            if (data.type === 'banner' && Array.isArray(data.banners)) {
                data.banners.forEach((banner: any, index: number) => {
                    if (banner.id) {
                        formData.append(`banners[${index}][id]`, String(banner.id));
                    }
                    if (banner.image instanceof File) {
                        formData.append(`banners[${index}][image]`, banner.image);
                    }
                    if (banner.image_mobile instanceof File) {
                        formData.append(`banners[${index}][image_mobile]`, banner.image_mobile);
                    }
                    if (banner.link) {
                        formData.append(`banners[${index}][link]`, banner.link);
                    }

                    if (banner.title) {
                        Object.entries(banner.title).forEach(([lang, value]) => {
                            formData.append(`banners[${index}][title][${lang}]`, (value as string) || '');
                        });
                    }

                    // Use the same pattern for banner subtitle
                    if (banner.subtitle) {
                        Object.entries(banner.subtitle).forEach(([lang, value]) => {
                            formData.append(`banners[${index}][subtitle][${lang}]`, (value as string) || '');
                        });
                    }
                    if (typeof banner.arrangement !== 'undefined') {
                        formData.append(`banners[${index}][arrangement]`, String(banner.arrangement));
                    }
                    if (typeof banner.is_active !== 'undefined') {
                        formData.append(`banners[${index}][is_active]`, banner.is_active ? '1' : '0');
                    }
                });
            }

            if (data.type === 'product_section' && Array.isArray(data.product_section_items)) {
                data.product_section_items.forEach((item: any, index: number) => {
                    if (item.id) {
                        formData.append(`product_section_items[${index}][id]`, String(item.id));
                    }
                    formData.append(`product_section_items[${index}][product_id]`, String(item.product_id));
                    if (typeof item.arrangement !== 'undefined') {
                        formData.append(`product_section_items[${index}][arrangement]`, String(item.arrangement));
                    }
                });
            }

            const response = isEdit
                ? await updateHomeSection(Number(id), formData)
                : await createHomeSection(formData);

            if (response.result) {
                navigate("/home-sections");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Submit failed"));
        }
    };

    const handleCancel = () => {
        navigate("/home-sections");
    };
    function useAllProductsData(searchTerm: string): PaginatedData<{ id: number; label: string }> {
        const {
            data,
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            isLoading, isError: isErrorfetch
        } = useAllProducts(searchTerm);

        const productVariants = data?.pages.flatMap((page) => page.products) || [];
        return {
            items: productVariants.map((v) => ({ id: v.id, label: `${v.name.en} (${v.barcode})`, })),
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            isLoading,
            isError: isErrorfetch
        };
    }


    const onExistingBannerDelete = async (productImageId: number) => {
        return new Promise<{ result: boolean; message?: string }>((resolve) => {
            openConfirmDialog({
                title: t("Delete banner"),
                desc: t("Are you sure you want to delete this banner? This action cannot be undone."),
                onConfirm: async () => {
                    try {
                        const response = await deleteBanner(productImageId);

                        resolve({ result: response.result, message: response.message });
                    } catch (error: any) {
                        toast.error(error?.response?.data?.message || t("Delete failed"));
                        resolve({ result: false, message: t("Delete failed") });
                    }
                },
            });
        });
    };

    const { data } = useHomeSections({
        page: 1,
        per_page: 100,
    });
    const arrangements = Array.isArray(data?.home_sections)
        ? data.home_sections.map((home_section: HomeSection) => String(home_section.arrangement))
        : [];

    return {
        messages: t,
        isEdit,
        initialData,
        handleSubmit,
        handleCancel,
        confirmDialogProps,
        useAllProductsData,
        onExistingBannerDelete,
        arrangements
    };
}