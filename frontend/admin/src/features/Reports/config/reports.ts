import { useSettings } from '@/hooks/usePublicData';
import { ReportConfig } from '@/types/report';
import { getText } from '@/utils/getText';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useReportConfigs = (): Record<string, ReportConfig> => {
  const { t, i18n } = useTranslation();
  const { data: SettingsData } = useSettings();
  const order_statuses = SettingsData?.order_statuses;
  const categories = SettingsData?.categories || [];

  return useMemo(() => ({
    sales: {
      name: t('Sales'),
      endpoint: 'reports/sales',
      exportable: true,
      printable: true,
      filters: [
        { key: 'from', label: t('From Date'), type: 'date', placeholder: t('Start date') },
        { key: 'to', label: t('To Date'), type: 'date', placeholder: t('End date') },
        {
          key: 'status',
          label: t('Status'),
          type: 'select',
          options: order_statuses?.map((status, index) => ({
            value: index.toString(),
            label: status.name,
          })) || [],
        }
      ],
      columns: [
        { key: 'order_number', label: t('Order Number'), type: 'text', sortable: true },
        { key: 'client_name', label: t('Client Name'), type: 'text', sortable: true },
        { key: 'total_items', label: t('Items'), type: 'number', sortable: true },
        { key: 'total_amount', label: t('Amount'), type: 'currency', sortable: true },
        { key: 'status', label: t('Status'), type: 'status', sortable: true },
        { key: 'created_at', label: t('Placed At'), type: 'datetime', sortable: true },
        { key: 'delivered_at', label: t('Delivered At'), type: 'datetime', sortable: true }
      ]
    },
    products: {
      name: t('Products'),
      endpoint: 'reports/products',
      exportable: true,
      printable: true,
      filters: [
        { key: 'from', label: t('From Date'), type: 'date' },
        { key: 'to', label: t('To Date'), type: 'date' },
        {
          key: 'category_id',
          label: t('Category'),
          type: 'select',
          options: categories?.map((category) => ({
            value: category.id.toString(),
            label: getText(category.name, i18n.language),
          })) || [],
        }
      ],
      columns: [
        { key: 'id', label: t('ID'), type: 'text', sortable: true },
        { key: 'name', label: t('Product Name'), type: 'text', sortable: true },
        { key: 'category', label: t('Category'), type: 'text', sortable: true },
        { key: 'total_sold', label: t('Units Sold'), type: 'number', sortable: true },
        { key: 'net_revenue', label: t('Net Revenue'), type: 'currency', sortable: true }
      ]
    },
    categories: {
      name: t('Categories'),
      endpoint: 'reports/categories',
      exportable: true,
      printable: true,
      filters: [
        { key: 'from', label: t('From Date'), type: 'date' },
        { key: 'to', label: t('To Date'), type: 'date' }
      ],
      columns: [
        { key: 'id', label: t('ID'), type: 'text', sortable: true },
        { key: 'name', label: t('Category Name'), type: 'text', sortable: true },
        { key: 'total_sold', label: t('Units Sold'), type: 'number', sortable: true },
        { key: 'net_revenue', label: t('Net Revenue'), type: 'currency', sortable: true }
      ]
    },
    clients: {
      name: t('Clients'),
      endpoint: 'reports/clients',
      exportable: true,
      printable: true,
      filters: [
        { key: 'from', label: t('From Date'), type: 'date' },
        { key: 'to', label: t('To Date'), type: 'date' }
      ],
      columns: [
        { key: 'id', label: t('ID'), type: 'text', sortable: true },
        { key: 'name', label: t('Client Name'), type: 'text', sortable: true },
        { key: 'email', label: t('Email'), type: 'text', sortable: true },
        { key: 'total_orders', label: t('Total Orders'), type: 'number', sortable: true },
        { key: 'total_spent', label: t('Total Spent'), type: 'currency', sortable: true },
        { key: 'avg_order_value', label: t('Avg Order Value'), type: 'currency', sortable: true }
      ]
    },
    payments: {
      name: t('Payments'),
      endpoint: 'reports/payments',
      exportable: true,
      printable: true,
      filters: [
        { key: 'from', label: t('From Date'), type: 'date' },
        { key: 'to', label: t('To Date'), type: 'date' }
      ],
      columns: [
        { key: 'payment_method', label: t('Payment Method'), type: 'text', sortable: true },
        { key: 'net_revenue', label: t('Net Revenue'), type: 'currency', sortable: true }
      ]
    },
    refunds: {
      name: t('Refunds'),
      endpoint: 'reports/refunds',
      exportable: true,
      printable: true,
      filters: [
        { key: 'from', label: t('From Date'), type: 'date' },
        { key: 'to', label: t('To Date'), type: 'date' }
      ],
      columns: [
        { key: 'product_name', label: t('Product'), type: 'text', sortable: true },
        { key: 'client_name', label: t('Client'), type: 'text', sortable: true },
        { key: 'total_refund', label: t('Refund Amount'), type: 'currency', sortable: true },
        { key: 'total_refund_orders', label: t('Refund Orders'), type: 'number', sortable: true }
      ]
    },
    delivery: {
      name: t('Delivery Performance'),
      endpoint: 'reports/delivery-performance',
      exportable: true,
      printable: true,
      filters: [
        { key: 'from', label: t('From Date'), type: 'date' },
        { key: 'to', label: t('To Date'), type: 'date' }
      ],
      columns: [
        { key: 'order_number', label: t('Order Number'), type: 'text', sortable: true },
        { key: 'created_at', label: t('Placed At'), type: 'datetime', sortable: true },
        { key: 'shipped_at', label: t('Shipped At'), type: 'datetime', sortable: true },
        { key: 'delivered_at', label: t('Delivered At'), type: 'datetime', sortable: true },
        { key: 'processing_hours', label: t('Processing (Hours)'), type: 'number', sortable: true },
        { key: 'delivery_hours', label: t('Delivery (Hours)'), type: 'number', sortable: true }
      ]
    }
  }), [order_statuses, categories, i18n.language, t]);
};