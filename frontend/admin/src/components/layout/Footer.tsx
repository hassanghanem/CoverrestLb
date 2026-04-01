import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bottom-0 border-t  text-sm flex flex-col sm:flex-row items-center justify-between p-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-3 sm:mb-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold ">{t("APPFINITY")}</span>
          <span className="text-gray-400">|</span>
          <span >{t("Building the future of apps")}</span>
        </div>

        <div className="flex items-center gap-4 ">
          <a
            href="https://appfinity.cloud/privacy"
            className="transition-colors"
          >
            {t("Privacy")}
          </a>
          <a
            href="https://appfinity.cloud/terms"
            className="transition-colors"
          >
            {t("Terms")}
          </a>
          <a
            href="https://appfinity.cloud/contact"
            className="transition-colors"
          >
            {t("Contact")}
          </a>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-gray-500">
          <a
            href="https://appfinity.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors font-medium"
          >
            © {currentYear} {t("APPFINITY")}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
