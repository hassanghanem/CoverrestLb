import { Main } from "@/components/layout/main";
import { GenericTable } from "@/components/datatable/GenericTable";
import { useTranslation } from "react-i18next";
import { useContactsTableLogic } from "./hooks/useContactsTableLogic";

export default function Contacts() {
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
   messages, // using the standard translation function from the hook
  } = useContactsTableLogic();

  return (
    <Main>
      <GenericTable
        title={t("Contacts")}
        table={table}
        columns={columns}
        data={data}
        isLoading={isLoading}
        isError={isError}
        messages={messages}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
      />
    </Main>
  );
}
