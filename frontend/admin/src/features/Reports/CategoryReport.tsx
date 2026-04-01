import { getCategoryReport } from "@/lib/services/Reports-services";
import { Main } from "@/components/layout/main";
import { ReportTable } from "./components/ReportTable";
import { useReportConfigs } from "./config/reports";
import { useReport } from "./hooks/useReport";
import { useTranslation } from "react-i18next";

export default function CategoryReport() {
  const { t } = useTranslation();
  const reportConfigs = useReportConfigs();

  const reportHook = useReport({
    fetcher: getCategoryReport,
    filters: reportConfigs.categories.filters
  });

  return (
    <Main>
      <ReportTable
        title={t("Category Report")}
        reportHook={reportHook}
        config={reportConfigs.categories}
        description={t("View performance and revenue for each product category")}
      />
    </Main>
  );
}