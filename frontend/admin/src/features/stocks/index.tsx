import { Main } from '@/components/layout/main';
import { GenericTable } from '@/components/datatable/GenericTable';
import { useTranslation } from 'react-i18next';
import { useStocksTableLogic } from './hooks/useStocksTableLogic';

export default function Stocks() {
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
  } = useStocksTableLogic();

  return (
    <Main>
      <GenericTable
        title={t("Stocks")}
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
