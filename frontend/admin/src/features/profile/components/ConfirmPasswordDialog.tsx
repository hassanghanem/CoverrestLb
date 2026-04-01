import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function ConfirmPasswordDialog({
  onConfirm,
  buttonTitle,
}: {
  onConfirm: (password: string) => void;
  buttonTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const { t } = useTranslation();

  const handleConfirm = () => {
    if (password.trim()) {
      onConfirm(password);
      setOpen(false);
      setPassword("");
    }
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)}>{buttonTitle}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Confirm your password")}</DialogTitle>
            <DialogDescription>
              {t("Please re-enter your password to continue.")}
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            placeholder={t("Enter your password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleConfirm}>{t("Confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
