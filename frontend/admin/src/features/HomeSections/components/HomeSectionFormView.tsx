import { ConfirmDialog } from "@/components/public/confirm-dialog";
import FullPageSpinner from "@/components/public/FullPageSpinner";
import { useHomeSectionFormLogic } from "../hooks/useHomeSectionFormLogic";
import { HomeSectionForm } from "./HomeSectionForm";

export default function HomeSectionFormView() {
    const {
        isEdit,
        initialData,
        handleSubmit,
        handleCancel,
        confirmDialogProps,
        useAllProductsData,
        onExistingBannerDelete,
        arrangements
    } = useHomeSectionFormLogic();

    const isLoading = isEdit && !initialData;

    if (isLoading) return <FullPageSpinner />;

    return (
        <>
            <HomeSectionForm
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isEdit={isEdit}
                useAllProductsData={useAllProductsData}
                onExistingBannerDelete={onExistingBannerDelete}
                arrangements={arrangements}
            />
            <ConfirmDialog {...confirmDialogProps} />
        </>
    );
}
