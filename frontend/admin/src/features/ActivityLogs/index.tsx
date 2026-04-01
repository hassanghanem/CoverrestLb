import { Main } from '@/components/layout/main';
import { useActivityLogsTableLogic } from './hooks/useActivityLogsTableLogic';
import { GenericTable } from '@/components/datatable/GenericTable';
import { useTranslation } from 'react-i18next';

export default function ActivityLogs() {
  const { t } = useTranslation();
  const {
    table,
    columns,
    data,
    isLoading,
    isError,
    searchInput,
    setSearchInput,
    handleSearch,
    handleRefresh,
  } = useActivityLogsTableLogic();

  return (
    <Main>
      <GenericTable
        title={t("Activity Logs")}
        table={table}
        columns={columns}
        data={data}
        isLoading={isLoading}
        isError={isError}
        messages={t}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
      />
    </Main>
  );
}
