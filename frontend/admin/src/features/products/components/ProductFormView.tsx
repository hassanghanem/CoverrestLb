import FullPageSpinner from "@/components/public/FullPageSpinner";
import { useProductFormLogic } from "../hooks/useProductFormLogic";
import { ProductForm } from "./ProductForm";
import { ConfirmDialog } from "@/components/public/confirm-dialog";
import { ReusableDialog } from "@/components/public/reusable-dialog";
import { CategoryForm } from "@/features/Categories/components/CategoryForm";
import { BrandForm } from "@/features/Settings/brands/components/BrandForm";
import { TagForm } from "@/features/Settings/tags/components/TagForm";
import { ColorForm } from "@/features/Settings/colors/components/ColorForm";
import { SizeForm } from "@/features/Settings/sizes/components/SizeForm";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createCategory } from "@/lib/services/Categories-services";
import { createBrand } from "@/lib/services/Brands-services";
import { createTag } from "@/lib/services/Tags-services";
import { createColor } from "@/lib/services/Colors-services";
import { createSize } from "@/lib/services/Sizes-services";


export default function ProductFormView() {
    const { t } = useTranslation();
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
    const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
    const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
    const [isSizeDialogOpen, setIsSizeDialogOpen] = useState(false);

    const {
        isEdit,
        initialData,
        rawProductData,
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
    } = useProductFormLogic();

    const isLoading = isEdit && !initialData;

    if (isLoading) return <FullPageSpinner />;

    const refreshSettings = async () => {
        try {
            await refetchSettings();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to refresh data"));
        }
    };

    const handleCreateCategory = async (data: any) => {
        try {
            const formData = new FormData();
            Object.entries(data.name || {}).forEach(([lang, value]) => {
                formData.append(`name[${lang}]`, String(value || ""));
            });
            if (data.arrangement) {
                formData.append("arrangement", String(data.arrangement));
            }
            if (data.image instanceof File) {
                formData.append("image", data.image);
            }

            const response = await createCategory(formData);
            if (response?.result) {
                setIsCategoryDialogOpen(false);
                await refreshSettings();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to create category"));
        }
    };

    const handleCreateBrand = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append("name", String(data.name || ""));
            const response = await createBrand(formData);
            if (response?.result) {
                setIsBrandDialogOpen(false);
                await refreshSettings();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to create brand"));
        }
    };

    const handleCreateTag = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append("name", String(data.name || ""));
            const response = await createTag(formData);
            if (response?.result) {
                setIsTagDialogOpen(false);
                await refreshSettings();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to create tag"));
        }
    };

    const handleCreateColor = async (data: any) => {
        try {
            const formData = new FormData();
            Object.entries(data.name || {}).forEach(([lang, value]) => {
                formData.append(`name[${lang}]`, String(value || ""));
            });
            formData.append("code", String(data.code || ""));
            const response = await createColor(formData);
            if (response?.result) {
                setIsColorDialogOpen(false);
                await refreshSettings();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to create color"));
        }
    };

    const handleCreateSize = async (data: any) => {
        try {
            const formData = new FormData();
            Object.entries(data.name || {}).forEach(([lang, value]) => {
                formData.append(`name[${lang}]`, String(value || ""));
            });
            const response = await createSize(formData);
            if (response?.result) {
                setIsSizeDialogOpen(false);
                await refreshSettings();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to create size"));
        }
    };

    return (
        <>
            <ProductForm
                initialData={initialData}
                rawProductData={rawProductData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                tags={tags}
                colors={colors}
                sizes={sizes}
                brands={brands}
                categories={categories}
                warehouses={warehouses}
                availabilityOptions={availabilityOptions}
                availabilityDisabled={availabilityDisabled}
                missingItems={missingItems}
                isEdit={isEdit}
                onExistingImageUpdate={onExistingImageUpdate}
                onExistingImageDelete={onExistingImageDelete}
                onExistingVariantDelete={onExistingVariantDelete}
                onExistingVariantImageUpdate={onExistingVariantImageUpdate}
                onExistingVariantImageDelete={onExistingVariantImageDelete}
                onGenerateBarcode={onGenerateBarcode}
                onAddCategory={() => setIsCategoryDialogOpen(true)}
                onAddBrand={() => setIsBrandDialogOpen(true)}
                onAddTag={() => setIsTagDialogOpen(true)}
                onAddColor={() => setIsColorDialogOpen(true)}
                onAddSize={() => setIsSizeDialogOpen(true)}
            />

            <ReusableDialog
                open={isCategoryDialogOpen}
                onClose={() => setIsCategoryDialogOpen(false)}
                title={t("Add Category")}
                description={t("Create a new category without leaving the product form")}
            >
                <CategoryForm
                    onSubmit={handleCreateCategory}
                    onCancel={() => setIsCategoryDialogOpen(false)}
                    isEdit={false}
                    arrangements={categoryArrangements}
                />
            </ReusableDialog>

            <ReusableDialog
                open={isBrandDialogOpen}
                onClose={() => setIsBrandDialogOpen(false)}
                title={t("Add Brand")}
                description={t("Create a new brand without leaving the product form")}
            >
                <BrandForm
                    onSubmit={handleCreateBrand}
                    onCancel={() => setIsBrandDialogOpen(false)}
                    isEdit={false}
                />
            </ReusableDialog>

            <ReusableDialog
                open={isTagDialogOpen}
                onClose={() => setIsTagDialogOpen(false)}
                title={t("Add Tag")}
                description={t("Create a new tag without leaving the product form")}
            >
                <TagForm
                    onSubmit={handleCreateTag}
                    onCancel={() => setIsTagDialogOpen(false)}
                    isEdit={false}
                />
            </ReusableDialog>

            <ReusableDialog
                open={isColorDialogOpen}
                onClose={() => setIsColorDialogOpen(false)}
                title={t("Add Color")}
                description={t("Create a new color without leaving the product form")}
            >
                <ColorForm
                    onSubmit={handleCreateColor}
                    onCancel={() => setIsColorDialogOpen(false)}
                    isEdit={false}
                />
            </ReusableDialog>

            <ReusableDialog
                open={isSizeDialogOpen}
                onClose={() => setIsSizeDialogOpen(false)}
                title={t("Add Size")}
                description={t("Create a new size without leaving the product form")}
            >
                <SizeForm
                    onSubmit={handleCreateSize}
                    onCancel={() => setIsSizeDialogOpen(false)}
                    isEdit={false}
                />
            </ReusableDialog>

            <ConfirmDialog {...confirmDialogProps} />
        </>
    );
}
