import { logout } from "@/lib/store/slices/authSlice";
import { AppDispatch } from "@/lib/store/store";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmDialog from "./ConfirmDialog";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      queryClient.invalidateQueries();
      setShowModal(false);
    } catch (error) {
      toast.error(t("Failed to log out. Please try again."));
      setShowModal(false);
    }
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setShowModal(true)}>
        <LogOut className="w-4 h-4" />
        {t("Logout")}
      </Button>
      <ConfirmDialog
        isOpen={showModal}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        onCancel={() => setShowModal(false)}
        onConfirm={handleLogout}
        confirmText="Logout"
        cancelText="Cancel"
      />
    </>
  );
}
