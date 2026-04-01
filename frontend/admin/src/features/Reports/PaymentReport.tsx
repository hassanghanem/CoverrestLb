import { getPaymentReport } from "@/lib/services/Reports-services";
import { Main } from "@/components/layout/main";
import { ReportTable } from "./components/ReportTable";
import { useReportConfigs } from "./config/reports";
import { useReport } from "./hooks/useReport";
import { useTranslation } from "react-i18next";

export default function PaymentReport() {
  const { t } = useTranslation();
  const reportConfigs = useReportConfigs();

  const reportHook = useReport({
    fetcher: getPaymentReport,
    filters: reportConfigs.payments.filters
  });

  return (
    <Main>
      <ReportTable
        title={t("Payment Report")}
        reportHook={reportHook}
        config={reportConfigs.payments}
        description={t("View revenue distribution by payment method")}
      />
    </Main>
  );
}