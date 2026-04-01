import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface FormActionsProps {
    onCancel: () => void;
    isSubmitting: boolean;
    submitLabel?: string;
    submitingLabel?: string;
    cancelLabel?: string;
}

export const FormActions = ({
    onCancel,
    isSubmitting = false,
    submitLabel,
    submitingLabel,
    cancelLabel,
}: FormActionsProps) => {
    const { t } = useTranslation();

    return (
        <div className="flex justify-end gap-2 pt-2">
            <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
            >
                {cancelLabel ? t(cancelLabel) : t("Cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <span className="flex items-center gap-2">
                        {submitingLabel ? t(submitingLabel) : t("Submitting")}
                    </span>
                ) : (
                    submitLabel ? t(submitLabel) : t("Submit")
                )}
            </Button>
        </div>
    );
};
