import { Main } from "@/components/layout/main";
import { GenericTable } from "@/components/datatable/GenericTable";
import { useCouponsTableLogic } from "./hooks/useCouponsTableLogic";
import { CouponForm } from "./components/CouponForm";
import { useTranslation } from "react-i18next";
import { DeleteDialog } from "@/components/public/DeleteDialog";
import { ReusableDialog } from "@/components/public/reusable-dialog";

export default function Coupons() {
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
    setIsCouponFormOpen,
    isCouponFormOpen,
    editingCoupon,
    setEditingCoupon,
    handleSubmitCouponForm,
    deleteDialogProps,
    useAllClientsData,
  } = useCouponsTableLogic();

  // Inline dialogs as a single component
  const Dialogs = (
    <>
      {/* Add/Edit Coupon Dialog */}
      <ReusableDialog
        open={isCouponFormOpen}
        onClose={() => {
          setIsCouponFormOpen(false);
          setEditingCoupon(null);
        }}
        title={editingCoupon ? t("Update Coupon") : t("Add Coupon")}
        description={
          editingCoupon
            ? t("Update an existing coupon")
            : t("Add a new coupon")
        }
      >
        <CouponForm
          onSubmit={handleSubmitCouponForm}
          onCancel={() => setIsCouponFormOpen(false)}
          isEdit={!!editingCoupon}
          initialData={editingCoupon || undefined}
          useAllClientsData={useAllClientsData}
        />
      </ReusableDialog>

      {/* Delete Coupon Dialog */}
      <DeleteDialog {...deleteDialogProps} />
    </>
  );

  return (
    <Main>
      <GenericTable
        title={t("Coupons")}
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
        onAdd={() => setIsCouponFormOpen(true)}
        DialogComponent={Dialogs}
      />
    </Main>
  );
}
