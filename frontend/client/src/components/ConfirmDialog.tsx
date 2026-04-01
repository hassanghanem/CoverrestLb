import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";

export interface ConfirmDialogProps {
  title?: string;
  message: string;
  messageValues?: Record<string, any>;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  messageValues,
  isOpen,
  onCancel,
  onConfirm,
  confirmText,
  cancelText,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? t("Confirm")}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{t(message, messageValues)}</DialogDescription>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            {cancelText ?? t("Cancel")}
          </Button>
          <Button variant="default" onClick={onConfirm}>
            {confirmText ?? t("Confirm")}
          </Button>
        </DialogFooter>

        <DialogClose />
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
