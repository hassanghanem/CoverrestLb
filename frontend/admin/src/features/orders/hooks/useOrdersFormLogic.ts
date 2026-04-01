import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderById, updateOrder, fetchOrderReceiptHtml } from '@/lib/services/Orders-services';
import { toast } from 'sonner';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings, useOrderableVariants, useClientAddresses } from '@/hooks/usePublicData';
import type { PaginatedData } from '@/types/api.interfaces';

type Field = 'status' | 'payment_method' | 'payment_status' | 'source';

export function useOrdersFormLogic() {
    const { t } = useTranslation();
    const { OrderId } = useParams<{ OrderId: string }>();
    const [sendStatusEmail, setSendStatusEmail] = useState(false);
    const [activeDialogProps, setActiveDialogProps] = useState({
        open: false,
        field: '' as Field,
        value: 0 as number | string,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [infoLoading, setInfoLoading] = useState(false);

    const { data, isLoading: isQueryLoading, isError, error, refetch } = useQuery({
        queryKey: ['order', OrderId],
        queryFn: () => getOrderById(Number(OrderId)),
        enabled: !!OrderId,
    });

    const order = data?.order;
    const isStatusLocked = false;
    const handleChange = (field: Field, value: number | string) => {
        if (!OrderId) return;
        setSendStatusEmail(field !== 'status');
        setActiveDialogProps({ open: true, field, value });
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            const payload: Record<string, any> = {
                [activeDialogProps.field]: activeDialogProps.value,
            };

            if (activeDialogProps.field === 'status') {
                payload.send_notification_email = sendStatusEmail;
            }

            const response = await updateOrder(Number(OrderId), payload);

            if (response.result) {
                refetch();
            } else {
                toast.error(t('Failed to update order'));
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || t('An unexpected error occurred'));
        } finally {
            setIsLoading(false);
            setActiveDialogProps(prev => ({ ...prev, open: false }));
        }
    };

    const onOpenChange = (open: boolean) => {
        if (!open) {
            setActiveDialogProps(prev => ({ ...prev, open: false }));
        }
    };

    const getFieldDisplayName = (field: Field): string => {
        switch (field) {
            case 'status': return t('status');
            case 'payment_method': return t('payment method');
            case 'payment_status': return t('payment status');
            case 'source': return t('source');
            default: return field;
        }
    };

    const { data: SettingsData } = useSettings();

    const allowedTransitions = SettingsData?.order_status_transitions ?? {};
    const allowedPaymentStatusTransitions = SettingsData?.payment_status_transitions ?? {};

    const paymentMethodOptions = Array.isArray(SettingsData?.payment_methods)
        ? SettingsData.payment_methods
        : [];


    const orderStatusOptions = Array.isArray(SettingsData?.order_statuses)
        ? SettingsData.order_statuses
        : [];

    const paymentStatusOptions = Array.isArray(SettingsData?.payment_statuses)
        ? SettingsData.payment_statuses.map((label, value) => ({ value, label: t(label) }))
        : [];

    const orderSources = Array.isArray(SettingsData?.order_sources)
        ? SettingsData.order_sources
        : [];

    const getVariantsData = (searchTerm: string): PaginatedData<any> => {
        const { data: variantsData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isVariantsLoading, isError: isVariantsError } = useOrderableVariants(searchTerm);
        const all = variantsData?.pages.flatMap((page: any) => page.productVariants)?.map((v: any) => {
            const preferredWarehouse = v.warehouses?.find((w: any) => w.quantity > 0) ?? v.warehouses?.[0];
            const colorName = v.color?.name?.en || 'N/A';
            const sizeName = v.size?.name?.en ? ` - ${v.size.name.en}` : '';
            return {
                id: v.id,
                label: `${v.sku} - ${v.product?.name?.en || 'N/A'} (${colorName}${sizeName})`,
                sku: v.sku,
                price: v.price,
                discount: v.discount,
                available_quantity: v.available_quantity,
                cost_price: v.cost_price ?? v.cost ?? v.product?.cost ?? 0,
                warehouses: v.warehouses,
                warehouse_id: preferredWarehouse?.warehouse_id,
                warehouse_name: preferredWarehouse?.warehouse_name,
                product: v.product,
                color: v.color,
                size: v.size,
            };
        }) || [];
        return {
            items: all,
            fetchNextPage,
            hasNextPage: !!hasNextPage,
            isFetchingNextPage,
            isLoading: isVariantsLoading,
            isError: isVariantsError,
        } as PaginatedData<any>;
    };

    const getClientAddressesData = (searchTerm: string): PaginatedData<any> => {
        const clientId = order?.client?.id;
        const { data: addressesData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isAddressesLoading, isError: isAddressesError } = useClientAddresses(clientId, searchTerm);
        const all = addressesData?.pages.flatMap((page: any) => page.addresses)?.map((a: any) => ({
            id: a.id,
            label: ` ${a.city}, ${a.address}, (${a.recipient_name})`,
        })) || [];
        return {
            items: all,
            fetchNextPage,
            hasNextPage: !!hasNextPage,
            isFetchingNextPage,
            isLoading: isAddressesLoading,
            isError: isAddressesError,
        } as PaginatedData<any>;
    };

    const updateOrderInfo = async (payload: {
        address_id?: number;
        coupon_code: string | null;
        notes: string;
        delivery_amount: number;
    }) => {
        if (!order) return;

        setInfoLoading(true);
        try {
            const response = await updateOrder(order.id, payload);
            if (response?.result) {
                await refetch();
            } else {
                toast.error(t('Failed to update order'));
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || t('An unexpected error occurred'));
        } finally {
            setInfoLoading(false);
        }
    };

    const handlePrintReceipt = async () => {
        if (!order?.id) return;
        const html = await fetchOrderReceiptHtml(order.id);
        if (!html) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    return {
        order,
        isLoading: isQueryLoading,
        isError,
        error,
        isStatusLocked,
        allowedTransitions,
        handleChange,
        refetch,
        allowedPaymentStatusTransitions,
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
        activeDialogProps: {
            ...activeDialogProps,
            onOpenChange,
            handleConfirm,
            isLoading,
            title: t('Change {{field}}', { field: getFieldDisplayName(activeDialogProps.field) }),
            desc: t('Are you sure you want to change the {{field}}?', { field: getFieldDisplayName(activeDialogProps.field) }),
            cancelBtnText: t('Cancel'),
            confirmText: t('Confirm'),
            destructive: false,
        },
    };
}
