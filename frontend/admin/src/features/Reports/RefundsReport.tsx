import { getRefundsReport } from "@/lib/services/Reports-services";
import { Main } from "@/components/layout/main";
import { ReportTable } from "./components/ReportTable";
import { useReportConfigs } from "./config/reports";
import { useReport } from "./hooks/useReport";
import { useTranslation } from "react-i18next";

export default function RefundsReport() {
  const { t } = useTranslation();
  const reportConfigs = useReportConfigs();

  const reportHook = useReport({
    fetcher: getRefundsReport,
    filters: reportConfigs.refunds.filters
  });

  return (
    <Main>
      <ReportTable
        title={t("Refunds Report")}
        reportHook={reportHook}
        config={reportConfigs.refunds}
        description={t("Track refund amounts and refunded orders by product and client")}
      />
    </Main>
  );
}