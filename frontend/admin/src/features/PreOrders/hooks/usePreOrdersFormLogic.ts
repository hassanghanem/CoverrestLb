import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPreOrderById, updatePreOrder } from '@/lib/services/PreOrders-services';
import { toast } from 'sonner';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings, useProductVariantsCanBePreOrder, useClientAddresses } from '@/hooks/usePublicData';
import type { PaginatedData } from '@/types/api.interfaces';

type Field = 'convert_to_order' | 'payment_method' | 'payment_status';
const allowedPaymentStatusTransitions: Record<number, number[]> = {
    0: [0, 1, 2], // Pending -> Pending, Paid, Failed
    1: [1],       // Paid -> Paid
    2: [2, 1],    // Failed -> Failed, Paid
    3: [3],       // Refunded -> Refunded
};

export function usePreOrdersFormLogic() {
    const { t: messages } = useTranslation();
    const { OrderId } = useParams<{ OrderId: string }>();
    const [activeDialogProps, setActiveDialogProps] = useState({
        open: false,
        field: '' as Field,
        // value can be numeric (status flags) or string (payment_method)
        value: 0 as number | string,
    });
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [infoLoading, setInfoLoading] = useState(false);

    const { data, isLoading: isQueryLoading, isError, error, refetch } = useQuery({
        queryKey: ['pre-order', OrderId],
        queryFn: () => getPreOrderById(Number(OrderId)),
        enabled: !!OrderId,
    });

    const order = data?.order;
    const isStatusLocked = order ? [6, 7, 8, 10].includes(order.status) : false;

    const handleChange = (field: Field, value: number | string) => {
        if (!OrderId) return;
        setActiveDialogProps({ open: true, field, value });
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            const response = await updatePreOrder(Number(OrderId), {
                [activeDialogProps.field]: activeDialogProps.value,
            });
            if (response.result) {
                if (activeDialogProps.field === 'convert_to_order') {
                    navigate('/orders');
                } else {
                    refetch();
                }
            }
        } catch {
            toast.error(messages('An unexpected error occurred.'));
        } finally {
            setIsLoading(false);
            setActiveDialogProps(prev => ({ ...prev, open: false }));
        }
    };

    const onOpenChange = (open: boolean) => {
        if (!open) setActiveDialogProps(prev => ({ ...prev, open: false }));
    };

    const { data: settingsData } = useSettings();
    const paymentMethods = settingsData?.payment_methods || [];
    const paymentStatuses = settingsData?.payment_statuses || [];

    // Variants helper
    const variantsHookResult = useProductVariantsCanBePreOrder("");

    const getVariantsData = (searchTerm: string): PaginatedData<any> => {
        const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isVariantsLoading, isError: isVariantsError } = variantsHookResult;

        let allVariants = data?.pages.flatMap((page: any) => page.productVariants) || [];

        if (searchTerm) {
            allVariants = allVariants.filter((v: any) =>
                v.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.product?.name?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.color?.name?.en?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        const all = allVariants.map((v: any) => {
            const colorName = v.color?.name?.en || 'N/A';
            const sizeName = v.size?.name?.en ? ` - ${v.size.name.en}` : '';
            return {
                id: v.id,
                label: `${v.sku} - ${v.product?.name?.en || 'N/A'} (${colorName}${sizeName})`,
                sku: v.sku,
                price: v.price,
                discount: v.discount,
                available_quantity: v.available_quantity,
                product: v.product,
                color: v.color,
                size: v.size,
            };
        });

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
        const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isAddressesLoading, isError: isAddressesError } = useClientAddresses(clientId, searchTerm);
        const all = data?.pages.flatMap((page: any) => page.addresses)?.map((a: any) => ({
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

    const updatePreOrderInfo = async (payload: {
        address_id?: number;
        coupon_code: string | null;
        notes: string;
        delivery_amount: number;
    }) => {
        if (!OrderId) return;

        setInfoLoading(true);
        try {
            const response = await updatePreOrder(Number(OrderId), payload);
            if (response?.result) {
                await refetch();
            } else {
                toast.error(messages('An unexpected error occurred.'));
            }
        } catch {
            toast.error(messages('An unexpected error occurred.'));
        } finally {
            setInfoLoading(false);
        }
    };

    const updatePreOrderItems = async (detailsPayload: any[]) => {
        if (!OrderId) return;

        try {
            const response = await updatePreOrder(Number(OrderId), { order_details: detailsPayload });
            if (response?.result) {
                await refetch();
            } else {
                toast.error(messages('An unexpected error occurred.'));
            }
        } catch {
            toast.error(messages('An unexpected error occurred.'));
        }
    };

    const updatePreOrderAddress = async (addressId: number) => {
        if (!OrderId) return;

        try {
            const response = await updatePreOrder(Number(OrderId), { address_id: addressId });
            if (response?.result) {
                await refetch();
            } else {
                toast.error(messages('An unexpected error occurred.'));
            }
        } catch {
            toast.error(messages('An unexpected error occurred.'));
        }
    };

    return {
        order,
        isLoading: isQueryLoading,
        isError,
        error,
        isStatusLocked,
        handleChange,
        refetch,
        allowedPaymentStatusTransitions,
        paymentMethods,
        paymentStatuses,
        getVariantsData,
        getClientAddressesData,
        updatePreOrderInfo,
        updatePreOrderItems,
        updatePreOrderAddress,
        infoLoading,
        activeDialogProps: {
            ...activeDialogProps,
            onOpenChange,
            handleConfirm,
            isLoading,
            title: messages('Change Field'),
            desc: messages('Are you sure you want to change this field?'),
            cancelBtnText: messages('Cancel'),
            confirmText: messages('Confirm'),
            destructive: false,
        },
    };
}
