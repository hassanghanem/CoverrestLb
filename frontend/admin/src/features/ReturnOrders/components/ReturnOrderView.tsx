import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReturnOrdersFormLogic } from '../hooks/useReturnOrdersFormLogic';
import NotFoundError from '@/features/Errors/NotFoundError';
import { ReturnOrderDetail } from '@/types/api.interfaces';
import { ConfirmDialog } from '@/components/public/confirm-dialog';
import StaticFullPageSpinner from '@/components/public/StaticFullPageSpinner';
import { formatPrice } from '@/utils/formatPrice';
import { RootState } from '@/lib/store/store';
import { useSelector } from 'react-redux';
export default function ReturnOrderView() {
  const { t, i18n } = useTranslation();
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);

  const {
    returnOrder: Returnorder,
    isLoading,
    isError,
    isStatusLocked,
    allowedTransitions,
    handleChange,
    activeDialogProps,
    statusOptions
  } = useReturnOrdersFormLogic();



  if (isLoading) return <StaticFullPageSpinner />;
  if (isError || !Returnorder)
    return <NotFoundError />;

  return (
    <main className="p-6 w-full space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("Return Order Details")} #{Returnorder.return_order_number}
        </h2>
        <p className="text-muted-foreground">
          {t("Original Order")} #{Returnorder.order.order_number}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("Items")}</CardTitle>
        </CardHeader>
        <CardContent>
          {Returnorder.details.length === 0 ? (
            <p className="text-muted-foreground">{t("No items found")}</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left">{t("Product")}</th>
                    <th className="px-4 py-2 text-left">{t("Variant")}</th>
                    <th className="px-4 py-2 text-left">{t("Quantity")}</th>
                    <th className="px-4 py-2 text-left">{t("Unit Price")}</th>
                    <th className="px-4 py-2 text-left">{t("Refund Amount")}</th>
                    <th className="px-4 py-2 text-left">{t("Subtotal")}</th>
                    <th className="px-4 py-2 text-left">{t("Warehouse")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {Returnorder.details.map((detail: ReturnOrderDetail) => (
                    <tr key={detail.id}>
                      <td className="flex items-center gap-4 px-4 py-2">
                        <img
                          src={detail.product.image}
                          alt={detail.product.name.en}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <span>{detail.product.name.en}</span>
                      </td>
                      <td className="px-4 py-2">
                        {detail.variant
                          ? `${detail.variant.color?.name.en || ''}`
                          : t("N/A")}
                      </td>
                      <td className="px-4 py-2">{detail.quantity}</td>
                      <td className="px-4 py-2">{formatPrice(detail.refund_amount * selectedCurrency.exchange_rate, selectedCurrency.code, i18n.language)}</td>
                      <td className="px-4 py-2">{formatPrice(detail.refund_amount * selectedCurrency.exchange_rate, selectedCurrency.code, i18n.language)}</td>
                      <td className="px-4 py-2">{formatPrice(detail.total * selectedCurrency.exchange_rate, selectedCurrency.code, i18n.language)}</td>
                      <td className="px-4 py-2">{detail.warehouse?.name || t("N/A")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t("Information")}</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">{t("Client Information")}</h4>
              <p><strong>{t("Client Name")}:</strong> {Returnorder.order.client.name}</p>
              <p><strong>{t("Phone")}:</strong> {Returnorder.order.client.phone}</p>
              <p><strong>{t("Email")}:</strong> {Returnorder.order.client.email || t("N/A")}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t("Return Details")}</h4>
              <p><strong>{t("Reason")}:</strong> {Returnorder.reason || t("N/A")}</p>
              <p><strong>{t("Requested At")}:</strong> {Returnorder.created_at}</p>
            </div>
          </CardContent>
        </Card>


        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t("Controls")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="font-medium">{t("Change Status")}</label>
              <Select
                value={Returnorder.status.toString()}
                onValueChange={(val) => handleChange('status', Number(val))}
                disabled={isStatusLocked}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder={t("Select Status")} />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions?.map((s, index) => ({ s, index }))
                    .filter(({ index }) => allowedTransitions[Returnorder.status]?.includes(index))
                    .map(({ s, index }) => (
                      <SelectItem key={index} value={index.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}

                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t("Summary")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>{t("Total Items")}:</span>
              <span>{Returnorder.details.length}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("Total Quantity")}:</span>
              <span>
                {Returnorder.details.reduce((sum: any, item: { quantity: any; }) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2 mt-2">
              <span>{t("Refund Amount")}:</span>
              <span>
                {formatPrice(Returnorder.refund_amount * selectedCurrency.exchange_rate, selectedCurrency.code, i18n.language)}
              </span>
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
                { key: 'created_at', label: t('Requested'), color: 'blue' },
                { key: 'rejected_at', label: t('Rejected'), color: 'green' },
                { key: 'approved_at', label: t('Approved'), color: 'purple' },
                { key: 'completed_at', label: t('Completed'), color: 'amber' },
              ].map(({ key, label, color }) => (
                <div key={key} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 bg-${color}-500 rounded-full`}></div>
                    <span className="font-medium">{label}</span>
                  </div>
                  <span className="text-muted-foreground text-right">
                    {(Returnorder as any)[key] ? (Returnorder as any)[key] : t('N/A')}
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
      />
    </main>
  );
}