import { useEffect, useState } from 'react';
import { Trash2, Printer } from 'lucide-react';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrdersFormLogic } from '../hooks/useOrdersFormLogic';
import NotFoundError from '@/features/Errors/NotFoundError';
import { ConfirmDialog } from '@/components/public/confirm-dialog';
import StaticFullPageSpinner from '@/components/public/StaticFullPageSpinner';
import { formatPrice } from '@/utils/formatPrice';
import { RootState } from '@/lib/store/store';
import { useSelector } from 'react-redux';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateOrder } from '@/lib/services/Orders-services';
import { SearchablePaginatedSelect } from '@/components/fields/SearchablePaginatedSelect';
import { ReusableDialog } from '@/components/public/reusable-dialog';
import { AddressForm } from '@/features/Addresses/components/AddressForm';
import { useClientAddressDialog } from '@/features/Addresses/hooks/useClientAddressDialog';
import { useOrderItemsEditor } from '../hooks/useOrderItemsEditor';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function OrderView() {
    const { t, i18n } = useTranslation();
    const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);
    const {
        order,
        isLoading,
        isError,
        isStatusLocked,
        allowedTransitions,
        allowedPaymentStatusTransitions,
        handleChange,
        refetch,
        activeDialogProps,
        orderStatusOptions,
        paymentMethodOptions,
        paymentStatusOptions,
        getVariantsData,
        getClientAddressesData,
        updateOrderInfo,
        handlePrintReceipt,
        infoLoading,
        orderSources,
        sendStatusEmail,
        setSendStatusEmail,
    } = useOrdersFormLogic();

    const {
        editableItems,
        itemsLoading,
        existingVariantIds,
        handleVariantSelect,
        handleAddItem,
        handleItemFieldChange,
        handleDeleteItem,
        handleUpdateItems,
    } = useOrderItemsEditor({ order, refetch });

    const [addressId, setAddressId] = useState<number | undefined>(undefined);
    const [couponCode, setCouponCode] = useState<string | undefined>(undefined);
    const [notes, setNotes] = useState<string | undefined>(undefined);
    const [deliveryAmount, setDeliveryAmount] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (order) {
            setAddressId(order.address?.id);
            setCouponCode(order.coupon?.code ?? undefined);
            setNotes(order.notes ?? undefined);
            setDeliveryAmount(order.delivery_amount);
        }
    }, [order]);

    const {
        isOpen: isAddressDialogOpen,
        isEditing: isEditingAddress,
        isSubmitting: addressFormLoading,
        initialData: addressFormInitialData,
        openCreateDialog: openCreateAddressDialog,
        openEditDialog,
        closeDialog: closeAddressDialog,
        handleSubmit: handleAddressFormSubmit,
    } = useClientAddressDialog({
        clientId: order?.client?.id,
        onAddressCreated: async (newAddressId) => {
            setAddressId(newAddressId);
            await updateOrder(order.id, { address_id: newAddressId });
            await refetch();
        },
        onAddressUpdated: async () => {
            await refetch();
        },
    });

    const handleUpdateOrderInfo = async () => {
        if (!order) return;

        const payload: any = {
            address_id: addressId,
            coupon_code: couponCode && couponCode.trim().length > 0 ? couponCode.trim() : null,
            notes: notes ?? '',
            delivery_amount: deliveryAmount ?? 0,
        };

        await updateOrderInfo(payload);
    };

    if (isLoading) return <StaticFullPageSpinner />;
    if (isError || !order) return <NotFoundError />;
    return (
        <main className="p-6 w-full space-y-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-3xl font-bold tracking-tight">
                    {t('Order Details')} #{order.order_number}
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintReceipt}
                >
                    <Printer className="h-4 w-4 mr-2" />
                    {t('Print Receipt')}
                </Button>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <CardTitle>{t('Items')}</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleAddItem}>
                            {t('Add Item')}
                        </Button>
                        {editableItems.length > 0 && (
                            <Button size="sm" onClick={handleUpdateItems} disabled={itemsLoading}>
                                {itemsLoading ? t('Saving...') : t('Update Items')}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {editableItems.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">{t('No Details')}</p>
                    ) : (
                        <div className="space-y-4">
                            {editableItems.map((item) => {
                                const subtotal = (Number(item.price) || 0) * (Number(item.quantity) || 0) * (1 - (Number(item.discount) || 0) / 100);
                                const totalCost = (Number((item as any).cost_price) || 0) * (Number(item.quantity) || 0);
                                const profit = subtotal - totalCost;

                                return (
                                    <div key={item.key} className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
                                        {/* Product Header with Delete Button */}
                                        <div className="flex items-start gap-4 mb-4 pb-4 border-b">
                                            {item.product_image && (
                                                <img
                                                    src={item.product_image}
                                                    alt={item.product_name || ''}
                                                    className="w-20 h-20 object-cover rounded-lg border shrink-0"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-base mb-2 truncate">{item.product_name || ""}</h4>
                                                <div className="w-full max-w-md">
                                                    {!!item.id ? (
                                                        <div className="px-3 py-2 rounded-md border bg-muted text-xs font-mono text-foreground">
                                                            {item.variant_label || t('N/A')}
                                                        </div>
                                                    ) : (
                                                        <SearchablePaginatedSelect
                                                            placeholder={t('Select variant')}
                                                            fetchData={(searchTerm) => {
                                                                const data = getVariantsData(searchTerm);
                                                                return {
                                                                    ...data,
                                                                    items: data.items.filter((v: any) => !existingVariantIds.has(v.id)),
                                                                };
                                                            }}
                                                            labelKey="label"
                                                            field={{
                                                                value: item.variant_id,
                                                                onChange: (_value, option) => handleVariantSelect(item.key, option || {}),
                                                            }}
                                                        />
                                                    )}
                                                    {item.errors?.variant_id && (
                                                        <p className="text-xs text-red-600 mt-1">{item.errors.variant_id}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteItem(item.key)}
                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    title={t('Delete Item')}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <div className="text-right">
                                                    <div className="text-xs text-muted-foreground mb-1">{t('Subtotal')}</div>
                                                    <div className="text-lg font-bold">
                                                        {formatPrice(subtotal * selectedCurrency.exchange_rate, selectedCurrency.code, i18n.language)}
                                                    </div>
                                                    <div className="text-xs text-green-600 font-medium mt-1">
                                                        {t('Profit')}: {formatPrice(profit * selectedCurrency.exchange_rate, selectedCurrency.code, i18n.language)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Editable Fields Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                            {/* Quantity */}
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground block mb-1">
                                                    {t('Quantity')}
                                                </label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity ?? ''}
                                                    onChange={(e) => handleItemFieldChange(item.key, 'quantity', Number(e.target.value))}
                                                    className="text-center h-9"
                                                />
                                                {item.errors?.quantity && (
                                                    <p className="text-xs text-red-600 mt-1">{item.errors.quantity}</p>
                                                )}
                                                {item.available_quantity !== undefined && (
                                                    <p className="text-xs text-muted-foreground mt-1">{t('Stock')}: {item.available_quantity}</p>
                                                )}
                                            </div>

                                            {/* Unit Price */}
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground block mb-1">
                                                    {t('Unit Price')}
                                                </label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    value={item.price ?? ''}
                                                    onChange={(e) => handleItemFieldChange(item.key, 'price', Number(e.target.value))}
                                                    className="text-center h-9"
                                                />
                                                {item.errors?.price && (
                                                    <p className="text-xs text-red-600 mt-1">{item.errors.price}</p>
                                                )}
                                            </div>

                                            {/* Discount */}
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground block mb-1">
                                                    {t('Discount')} (%)
                                                </label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    step="1"
                                                    value={item.discount ?? 0}
                                                    onChange={(e) => handleItemFieldChange(item.key, 'discount', Number(e.target.value))}
                                                    className="text-center h-9"
                                                />
                                                {item.errors?.discount && (
                                                    <p className="text-xs text-red-600 mt-1">{item.errors.discount}</p>
                                                )}
                                            </div>

                                            {/* Cost Price */}
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground block mb-1">
                                                    {t('Cost Price')}
                                                </label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    value={(item as any).cost_price ?? ''}
                                                    onChange={(e) => handleItemFieldChange(item.key, 'cost_price' as any, Number(e.target.value))}
                                                    className="text-center h-9"
                                                />
                                            </div>

                                            {/* Warehouse (Editable) */}
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground block mb-1">
                                                    {t('Warehouse')}
                                                </label>
                                                <Select
                                                    value={item.warehouse_id !== undefined ? String(item.warehouse_id) : ''}
                                                    onValueChange={(val) => handleItemFieldChange(item.key, 'warehouse_id', Number(val))}
                                                >
                                                    <SelectTrigger className="w-full h-9">
                                                        <SelectValue placeholder={t('Select warehouse')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(item.warehouses ?? []).map((w) => (
                                                            <SelectItem key={w.warehouse_id} value={String(w.warehouse_id)}>
                                                                {w.warehouse_name} {w.quantity !== undefined ? `(${t('Stock')}: ${w.quantity})` : ''}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>{t('Information')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-semibold mb-2">{t('Client Information')}</h4>
                            <p><strong>{t('Client Name')}:</strong> {order.client.name}</p>
                            <p><strong>{t('Phone')}:</strong> {order.client.phone}</p>
                            <p><strong>{t('Client Email')}:</strong> {order.client.email || t('N/A')}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">{t('Address')}</h4>
                            <p><strong>{t('Recipient_name')}:</strong> {order.address.recipient_name}</p>
                            <p><strong>{t('City')}:</strong> {order.address.city}</p>
                            <p><strong>{t('Address')}:</strong> {order.address.address}</p>
                            <p><strong>{t('Phone Number')}:</strong> {order.address.phone_number}</p>
                            {order.address.notes && (
                                <p><strong>{t('Notes')}:</strong> {order.address.notes}</p>
                            )}
                        </div>

                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>{t('Controls')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-3 md:col-span-1">
                            <label className="font-medium">{t('Change Status')}</label>
                            <Select
                                value={order.status.toString()}
                                onValueChange={(val) => handleChange("status", Number(val))}
                                disabled={isStatusLocked}
                            >
                                <SelectTrigger className='w-full'><SelectValue placeholder={t('Select Status')} /></SelectTrigger>
                                <SelectContent>
                                    {orderStatusOptions?.map((s, index) => ({ s, index }))
                                        .filter(({ index }) => allowedTransitions[order.status]?.includes(index))
                                        .map(({ s, index }) => (
                                            <SelectItem key={index} value={index.toString()}>
                                                {s.name}
                                            </SelectItem>
                                        ))}


                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 col-span-3 md:col-span-1">
                            <label className="font-medium">{t('Payment Method')}</label>
                            <Select
                                value={order.payment_method}
                                onValueChange={(val) => handleChange("payment_method", val)}
                                disabled={isStatusLocked}
                            >
                                <SelectTrigger className='w-full'><SelectValue placeholder={t('Select Payment Method')} /></SelectTrigger>
                                <SelectContent>
                                    {paymentMethodOptions.map((pm) => (
                                        <SelectItem key={pm.value} value={pm.value}>{pm.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 col-span-3 md:col-span-1">
                            <label className="font-medium">{t('Payment Status')}</label>
                            <Select
                                value={order.payment_status.toString()}
                                onValueChange={(val) => handleChange("payment_status", Number(val))}
                                disabled={isStatusLocked}
                            >
                                <SelectTrigger className='w-full'><SelectValue placeholder={t('Select Payment Status')} /></SelectTrigger>
                                <SelectContent>
                                    {paymentStatusOptions
                                        .filter((ps) => allowedPaymentStatusTransitions[order.payment_status]?.includes(ps.value))
                                        .map((ps) => (
                                            <SelectItem key={ps.value} value={ps.value.toString()}>{ps.label}</SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>

                        </div>
                        <div className="space-y-2 col-span-3 md:col-span-1">
                            <label className="font-medium">{t('Source')}</label>
                            <Select
                                value={order.source}
                                onValueChange={(val) => handleChange("source", val)}
                                disabled={isStatusLocked}
                            >
                                <SelectTrigger className='w-full'><SelectValue placeholder={t('Select Source')} /></SelectTrigger>
                                <SelectContent>
                                    {orderSources
                                        .map((ps) => (
                                            <SelectItem key={ps} value={ps}>{ps}</SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>

                        </div>



                        <div className="space-y-2 col-span-3 md:col-span-1">
                            <label className="font-medium">{t('Coupon Code')}</label>
                            <Input
                                value={couponCode ?? ''}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder={t('Enter coupon code')}
                            />
                        </div>

                        <div className="space-y-2 col-span-3 md:col-span-1">
                            <label className="font-medium">{t('Notes')}</label>
                            <Input
                                value={notes ?? ''}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t('Add notes')}
                            />
                        </div>

                        <div className="space-y-2 col-span-3 md:col-span-1">
                            <label className="font-medium">{t('Delivery Fee')}</label>
                            <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={deliveryAmount ?? ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setDeliveryAmount(val === '' ? undefined : Number(val));
                                }}
                            />
                        </div>
                        <div className="space-y-2 col-span-3 md:col-span-2">
                            <label className="font-medium">{t('Address')}</label>
                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                                <SearchablePaginatedSelect
                                    placeholder={t('Select address')}
                                    fetchData={(searchTerm) => getClientAddressesData(searchTerm)}
                                    field={{
                                        value: addressId,
                                        onChange: (value) => setAddressId(Number(value)),
                                    }}
                                    className="flex-1"
                                />
                                <div className="flex gap-2 sm:w-auto w-full">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 sm:flex-none"
                                        onClick={openCreateAddressDialog}
                                    >
                                        {t('Add')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 sm:flex-none"
                                        onClick={() => addressId && openEditDialog(addressId)}
                                        disabled={!addressId}
                                    >
                                        {t('Edit')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-3 flex justify-end pt-2">
                            <Button size="sm" onClick={handleUpdateOrderInfo} disabled={infoLoading}>
                                {infoLoading ? t('Saving...') : t('Update Order Info')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>{t('Summary')}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <div className="flex justify-between">
                            <span>{t('Subtotal')}:</span>
                            <span>{formatPrice(Number(order.subtotal) * selectedCurrency.exchange_rate, selectedCurrency.code, i18n.language)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t('Delivery Fee')}:</span>
                            <span>{formatPrice(Number(order.delivery_amount) * selectedCurrency.exchange_rate, selectedCurrency.code, i18n.language)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t('Discount')}:</span>
                            <span>
                                {order.coupon_value
                                    ? `${order.coupon_value}${order.coupon_type === "percentage" ? " %" : " $"}`
                                    : t('N/A')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t('Profit')}:</span>
                            <span>
                                {formatPrice(
                                    editableItems.reduce((acc, item) => {
                                        const subtotal = (Number(item.price) || 0) * (Number(item.quantity) || 0) * (1 - (Number(item.discount) || 0) / 100);
                                        const totalCost = (Number((item as any).cost_price) || 0) * (Number(item.quantity) || 0);
                                        return acc + (subtotal - totalCost);
                                    }, 0) * selectedCurrency.exchange_rate,
                                    selectedCurrency.code,
                                    i18n.language
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                            <span>{t('Total')}:</span>
                            <span>{formatPrice(Number(order.grand_total) * selectedCurrency.exchange_rate, selectedCurrency.code, i18n.language)}</span>
                        </div>
                    </CardContent>
                </Card>


                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>{t('Order Timeline')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            {[
                                { key: 'created_at', label: t('Created'), color: 'blue' },
                                { key: 'confirmed_at', label: t('Confirmed'), color: 'green' },
                                { key: 'packed_at', label: t('Packed'), color: 'purple' },
                                { key: 'shipped_at', label: t('Shipped'), color: 'orange' },
                                { key: 'delivered_at', label: t('Delivered'), color: 'emerald' },
                                { key: 'cancelled_at', label: t('Cancelled'), color: 'red' },
                                { key: 'returned_at', label: t('Returned'), color: 'amber' },
                            ].map(({ key, label, color }) => (
                                <div key={key} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 bg-${color}-500 rounded-full`}></div>
                                        <span className="font-medium">{label}</span>
                                    </div>
                                    <span className="text-muted-foreground text-right">
                                        {order[key] ? order[key] : t('N/A')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>



            <ConfirmDialog
                open={activeDialogProps.open}
                onOpenChange={activeDialogProps.onOpenChange}
                handleConfirm={activeDialogProps.handleConfirm}
                isLoading={activeDialogProps.isLoading}
                title={activeDialogProps.title}
                desc={activeDialogProps.desc}
                cancelBtnText={activeDialogProps.cancelBtnText}
                confirmText={activeDialogProps.confirmText}
                destructive={activeDialogProps.destructive}
            >
                {activeDialogProps.field === 'status' && (
                    <div className="flex items-center gap-2 mt-2">
                        <Checkbox
                            checked={sendStatusEmail}
                            onCheckedChange={(v) => setSendStatusEmail(Boolean(v))}
                            disabled={activeDialogProps.isLoading}
                            id="send-email"
                        />
                        <Label htmlFor="send-email">{t('Send notification email to client')}</Label>
                    </div>
                )}
            </ConfirmDialog>


            <ReusableDialog
                open={isAddressDialogOpen}
                onClose={closeAddressDialog}
                title={isEditingAddress ? t('Edit Address') : t('Add Address')}
                description={isEditingAddress ? t('Update existing address details') : t('Add a new address')}
            >
                <AddressForm
                    onSubmit={handleAddressFormSubmit}
                    onCancel={closeAddressDialog}
                    initialData={addressFormInitialData}
                    isEdit={isEditingAddress}
                    isSubmitting={addressFormLoading}
                />
            </ReusableDialog>
        </main>
    );
}
