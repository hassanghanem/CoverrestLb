import { Button } from "@/components/ui/button";
import { ReusableDialog } from "./reusable-dialog";
import { useTranslation } from "react-i18next";

interface DeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    loading?: boolean;
}

export const DeleteDialog = ({
    open,
    onClose,
    onConfirm,
    title,
    description,
    loading = false,
}: DeleteDialogProps) => {
    const { t } = useTranslation();

    return (
        <ReusableDialog
            open={open}
            onClose={onClose}
            title={title ? t(title) : t("Delete Confirmation")}
            description={description ? t(description) : t("Are you sure you want to delete? This action cannot be undone.")}
        >
            <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={onClose}>
                    {t("Cancel")}
                </Button>
                <Button variant="destructive" onClick={onConfirm} disabled={loading}>
                    {loading ? t("Deleting") : t("Delete")}
                </Button>
            </div>
        </ReusableDialog>
    );
};
