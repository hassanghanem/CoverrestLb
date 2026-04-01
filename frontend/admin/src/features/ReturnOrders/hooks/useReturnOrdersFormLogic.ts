import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getReturnOrderById, updateReturnOrderStatus } from '@/lib/services/ReturnOrders-services';
import { toast } from 'sonner';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/hooks/usePublicData';

type Field = 'status' | 'payment_method' | 'payment_status';

export function useReturnOrdersFormLogic() {
  const { t } = useTranslation();
  const { ReturnOrderId } = useParams<{ ReturnOrderId: string }>();
  const [activeDialogProps, setActiveDialogProps] = useState({
    open: false,
    field: '' as Field,
    value: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const { data, isLoading: isQueryLoading, isError, error, refetch } = useQuery({
    queryKey: ['ReturnOrder', ReturnOrderId],
    queryFn: () => getReturnOrderById(Number(ReturnOrderId)),
    enabled: !!ReturnOrderId,
  });

  const returnOrder = data?.return_order;

  const isStatusLocked = returnOrder ? [6, 7, 8, 10].includes(returnOrder.status) : false;

  const handleChange = (field: Field, value: number) => {
    if (!ReturnOrderId) return;
    setActiveDialogProps({ open: true, field, value });
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const response = await updateReturnOrderStatus(Number(ReturnOrderId), {
        [activeDialogProps.field]: activeDialogProps.value,
      });
      if (response.result) {
        refetch();
      } else {
        toast.error(t('Failed to update return order'));
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
      case 'status':
        return t('status');
      case 'payment_method':
        return t('payment method');
      case 'payment_status':
        return t('payment status');
      default:
        return field;
    }
  };

  const { data: SettingsData } = useSettings();

  // Dynamic order and payment transitions from settings
  const statusOptions = Array.isArray(SettingsData?.return_order_statuses)
    ? SettingsData.return_order_statuses
    : [];
  const allowedTransitions = SettingsData?.return_order_status_transitions ?? {};

  return {
    returnOrder,
    isLoading: isQueryLoading,
    isError,
    error,
    isStatusLocked,
    allowedTransitions,
    handleChange,
    refetch,
    statusOptions,
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