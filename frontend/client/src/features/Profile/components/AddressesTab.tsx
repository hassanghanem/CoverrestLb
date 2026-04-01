import React from "react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { useAddressesLogic } from "../hooks/useAddressesLogic";
import StaticFullPageSpinner from "@/components/StaticFullPageSpinner";
import GeneralError from "@/features/Errors/GeneralError";
import { useTranslation } from "react-i18next";
import AddressCard from "@/components/AddressCard";
import { AddressForm } from "@/components/AddressFormDialog";
import PaginationComponent from "@/components/Pagination";
import ConfirmDialog from "@/components/ConfirmDialog";

const AddressesTab: React.FC = () => {
  const {
    data,
    isLoading,
    isError,
    selectedAddress,
    isDialogOpen,
    deleteConfirmOpen,
    addressToDelete,
    onPageChange,
    handleClose,
    handleSubmit,
    handleEdit,
    handleAddNew,
    handleDelete,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useAddressesLogic();

  const { t } = useTranslation();

  if (isLoading) return <StaticFullPageSpinner />;
  if (isError || !data) return <GeneralError />;

  return (
    <TabsContent value="addresses" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("Saved Addresses")}</h2>
        <Button
          onClick={(e) => {
            e.preventDefault();
            handleAddNew();
          }}
        >
          {t("Add New Address")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.addresses.map((address, index) => (
          <AddressCard 
            key={index} 
            address={address} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
          />
        ))}
      </div>

      {(data.addresses.length ?? 0) > 0 && (
        <div className="col-lg-12 d-flex justify-content-center">
          <PaginationComponent
            pagination={data.pagination}
            onPageChange={onPageChange}
          />
        </div>
      )}

      <AddressForm
        key={selectedAddress ? `edit-${selectedAddress.id}` : "add"}
        isOpen={isDialogOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        initialData={selectedAddress || undefined}
        isEdit={!!selectedAddress}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Address"
        message={'Are you sure you want to delete the address "{{label}}"? This action cannot be undone.'}
        messageValues={{ label: addressToDelete?.address || "" }}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </TabsContent>
  );
};

export default AddressesTab;
