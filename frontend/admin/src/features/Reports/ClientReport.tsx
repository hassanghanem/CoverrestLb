import { getClientReport } from "@/lib/services/Reports-services";
import { Main } from "@/components/layout/main";
import { ReportTable } from "./components/ReportTable";
import { useReportConfigs } from "./config/reports";
import { useReport } from "./hooks/useReport";
import { useTranslation } from "react-i18next";

export default function ClientReport() {
  const { t } = useTranslation();
  const reportConfigs = useReportConfigs();

  const reportHook = useReport({
    fetcher: getClientReport,
    filters: reportConfigs.clients.filters
  });

  return (
    <Main>
      <ReportTable
        title={t("Client Report")}
        reportHook={reportHook}
        config={reportConfigs.clients}
        description={t("Analyze client activity, total orders, and spending patterns")}
      />
    </Main>
  );
}