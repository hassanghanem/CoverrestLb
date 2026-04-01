import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

interface ReusableDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export const ReusableDialog = ({ open, onClose, title, description, children, className }: ReusableDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        id="dialog-portal"
        className={`sm:max-w-xl max-h-[80vh] overflow-y-auto ${className || ""}`}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
