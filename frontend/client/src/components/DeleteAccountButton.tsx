import { deleteacc } from "@/lib/store/slices/authSlice";
import { AppDispatch } from "@/lib/store/store";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmDialog from "./ConfirmDialog";
import { Button } from "./ui/button";

export default function DeleteAccountButton() {
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteacc()).unwrap();
      queryClient.invalidateQueries();
      setShowModal(false);
    } catch (error) {
      toast.error(t("Failed to delete account"));
      setShowModal(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        className="w-full"
        onClick={(e) => {
          e.preventDefault();
          setShowModal(true);
        }}
      >
        {t("Delete Account")}
      </Button>

      <ConfirmDialog
        isOpen={showModal}
        title="Are you sure you want to delete your account?"
        message="Deleting your account is permanent and will remove all your data."
        onCancel={() => setShowModal(false)}
        onConfirm={handleDeleteAccount}
        confirmText="Delete Account"
        cancelText="Cancel"
      />
    </>
  );
}
