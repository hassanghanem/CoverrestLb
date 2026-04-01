import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "false");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[9999]">
      <div className="w-[360px] rounded-2xl shadow-xl bg-white border border-gray-200 p-5 text-gray-800 text-base">
        <div className="space-y-4">
          <p>
            <strong className="font-semibold">{t("Cookies")}:</strong>{" "}
            {t(
              "We use cookies to enhance your experience. By accepting, you agree to our cookie policy."
            )}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              onClick={handleDecline}
            >
              {t("Decline")}
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              onClick={handleAccept}
            >
              {t("Accept")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
