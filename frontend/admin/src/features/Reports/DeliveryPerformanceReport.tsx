import { getDeliveryPerformanceReport } from "@/lib/services/Reports-services";
import { Main } from "@/components/layout/main";
import { ReportTable } from "./components/ReportTable";
import { useReportConfigs } from "./config/reports";
import { useReport } from "./hooks/useReport";
import { useTranslation } from "react-i18next";

export default function DeliveryPerformanceReport() {
  const { t } = useTranslation();
  const reportConfigs = useReportConfigs();

  const reportHook = useReport({
    fetcher: getDeliveryPerformanceReport,
    filters: reportConfigs.delivery.filters
  });

  return (
    <Main>
      <ReportTable
        title={t("Delivery Performance Report")}
        reportHook={reportHook}
        config={reportConfigs.delivery}
        description={t("Monitor delivery timelines and performance metrics")}
      />
    </Main>
  );
}