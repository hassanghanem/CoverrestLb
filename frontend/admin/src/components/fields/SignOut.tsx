import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFullPageLoading } from "@/context/FullPageLoadingContext";
import { logout } from "@/lib/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store/store";
import { ConfirmDialog } from "../public/confirm-dialog";
import { DropdownMenuItem } from "../ui/dropdown-menu";

function SignOut() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { setFullPageLoading } = useFullPageLoading();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      setIsLoading(true);
      setFullPageLoading(true);
      await dispatch(logout()).unwrap();
      setFullPageLoading(false);
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setFullPageLoading(false);
      window.location.href = '/';
    } finally {
      setIsLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          setConfirmOpen(true);
        }}
      >
        {t("Logout")}
      </DropdownMenuItem>

      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={t("Confirm logout")}
          desc={t("Are you sure you want to logout?")}
          confirmText={t("Logout")}
          cancelBtnText={t("Cancel")}
          destructive
          handleConfirm={handleConfirmLogout}
          isLoading={isLoading}
        />
      )}
    </>
  );
}

export default SignOut;
