import { getProductReport } from "@/lib/services/Reports-services";
import { Main } from "@/components/layout/main";
import { ReportTable } from "./components/ReportTable";
import { useReportConfigs } from "./config/reports";
import { useReport } from "./hooks/useReport";
import { useTranslation } from "react-i18next";

export default function ProductReport() {
  const { t } = useTranslation();
  const reportConfigs = useReportConfigs();

  const reportHook = useReport({
    fetcher: getProductReport,
    filters: reportConfigs.products.filters
  });

  return (
    <Main>
      <ReportTable
        title={t("Product Report")}
        reportHook={reportHook}
        config={reportConfigs.products}
        description={t("Analyze product sales, units sold, and net revenue")}
      />
    </Main>
  );
}