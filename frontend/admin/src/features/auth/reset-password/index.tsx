import { useLocation } from 'react-router-dom';
import ResetPasswordFormComponent from './components/ResetPasswordFormComponent';
import { useTranslation } from 'react-i18next';

export default function ResetPassword() {
  const { t } = useTranslation();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const email = queryParams.get("email");

  return (
    <>
      {token && email ? (
        <ResetPasswordFormComponent token={token} email={email} />
      ) : (
        <div>{t("Invalid reset link.")}</div>
      )}
    </>
  );
}
