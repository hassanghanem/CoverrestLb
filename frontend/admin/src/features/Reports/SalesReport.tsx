import { getSalesReport } from "@/lib/services/Reports-services";
import { Main } from "@/components/layout/main";
import { ReportTable } from "./components/ReportTable";
import { useReportConfigs } from "./config/reports";
import { useReport } from "./hooks/useReport";
import { useTranslation } from "react-i18next";

export default function SalesReport() {
  const { t } = useTranslation();
  const reportConfigs = useReportConfigs(); 

  const reportHook = useReport({ 
    fetcher: getSalesReport,
    filters: reportConfigs.sales.filters
  });
  
  return (
    <Main>
      <ReportTable 
        title={t("Sales Report")}
        reportHook={reportHook} 
        config={reportConfigs.sales}
        description={t("View and analyze sales performance across different periods and filters")}
      />
    </Main>
  );
}