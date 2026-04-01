import { useLocation, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Order } from '@/types/api.interfaces';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

import { CheckCircle2, Phone, MapPin, ArrowRight, Package, Truck, CreditCard, Calendar, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getText } from '@/utils/getText';
import { formatPrice } from '@/utils/formatPrice';
import { getOrderStatuses } from '@/utils/getOrderStatuses';

export default function OrderConfirmation() {
    const location = useLocation();
    const order = location.state?.order as Order | undefined;
    const { t, i18n } = useTranslation();
    const lang = i18n.language || 'en';
    const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);
    if (!order) return <Navigate to="/" replace />;
    const isorder = order.is_preorder;

    const statuses = getOrderStatuses();
    const currentStatus = statuses.find((s) => s.id === order.status);

    let timeline = statuses
        .filter((s) => [0, 1, 2, 4, 5].includes(s.id))
        .map((status) => ({
            ...status,
            state:
                status.id < order.status
                    ? 'completed'
                    : status.id === order.status
                        ? 'current'
                        : 'upcoming',
        }));

    if ([3, 6, 7, 8, 9, 10].includes(order.status)) {
        timeline = [
            {
                ...currentStatus!,
                state: 'special',
            },
        ];
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-muted/20 to-background">
            <div className="container mx-auto py-10 lg:py-16 px-2">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6 relative">
                        <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        {isorder ? t('Thank you for your pre-order!') : t('Thank you for your order!')}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        {isorder
                            ? t('Your pre-order has been confirmed! We will notify you when your items are ready to ship.')
                            : t('Your order has been placed and is waiting for confirmation.')
                        }
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        {isorder && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-950 dark:border-blue-800">
                                <div className="flex items-center justify-center gap-2 text-center">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{t('Pre-order')}</p>
                                        <p className="text-xs text-blue-700 dark:text-blue-400">{t('Delivery date to be confirmed')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="bg-background border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">{t('Order Number')}</p>
                            <p className="font-semibold text-lg">#{order.order_number}</p>
                        </div>
                        <div className="bg-background border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">{t('Order Date')}</p>
                            <p className="font-semibold">
                                {new Date(order.created_at).toLocaleDateString(lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="bg-background border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">{t('Total Amount')}</p>
                            <p className="font-semibold text-lg">
                                {formatPrice(Number(order.grand_total) * selectedCurrency.exchange_rate, selectedCurrency.code, lang)}
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">{t('Order Progress')}</h3>
                            {isorder && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {t('Pre-order')}
                                </span>
                            )}
                        </div>
                        {isorder && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                            {t('Pre-order Processing')}
                                        </h4>
                                        <p className="text-blue-700 dark:text-blue-400 text-sm">
                                            {t('Your pre-order is being processed. We will notify you with expected delivery dates as soon as they are available. You can track progress here.')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="relative">
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-muted" />
                            <div className="space-y-8">
                                {timeline.map((step) => (
                                    <div key={step.id} className="relative flex items-start gap-4">
                                        <div
                                            className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center border-2 ${step.state === 'completed'
                                                ? 'bg-green-100 border-green-500 text-green-600 dark:bg-green-900/30'
                                                : step.state === 'current'
                                                    ? 'bg-blue-100 border-blue-500 text-blue-600 dark:bg-blue-900/30'
                                                    : step.state === 'special'
                                                        ? 'bg-red-100 border-red-500 text-red-600 dark:bg-red-900/30'
                                                        : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                                                }`}
                                        >
                                            <step.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-semibold ${step.state === 'upcoming' ? 'text-muted-foreground' : ''}`}>
                                                {t(step.name)}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {step.description ? t(step.description) : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-8 lg:grid-cols-2">
                    <div className="space-y-8">
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    {t('Order Items')}
                                    {isorder && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 ml-2 shrink-0">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            ({t('Pre-order Items')})
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 divide-y">
                                {order.order_details.map((item) => {
                                    const hasDiscount = item.discount > 0;
                                    const finalPrice = hasDiscount
                                        ? item.variant.price * (1 - item.discount / 100)
                                        : item.variant.price;

                                    return (
                                        <div key={item.id} className="p-4 hover:bg-muted/40 transition-colors flex gap-2">
                                            <div className="shrink-0">
                                                <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-32 lg:w-32 overflow-hidden rounded-lg bg-muted">
                                                    <img
                                                        src={item.variant.images[0]?.image || item.product.images[0]?.image}
                                                        alt={getText(item.product.name, i18n.language)}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-foreground break-words max-w-full">
                                                    {getText(item.product.name, lang)}
                                                </h4>

                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {t('Qty')}: {item.quantity}
                                                    {item.variant.color && (
                                                        <span> • {t('Color')}: {getText(item.variant.color.name, lang)}</span>
                                                    )}
                                                </div>
                                                {order?.coupon && item.product.coupon_eligible && (
                                                    <p className="text-[11px] lg:text-sm text-green-600">
                                                        {t("Coupon applied to this item")}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2">
                                                    {hasDiscount && (
                                                        <span className="line-through text-sm text-muted-foreground">
                                                            {formatPrice(
                                                                item.variant.price * selectedCurrency.exchange_rate,
                                                                selectedCurrency.code,
                                                                lang
                                                            )}
                                                        </span>
                                                    )}
                                                    <span className="font-semibold">
                                                        {formatPrice(
                                                            finalPrice * selectedCurrency.exchange_rate,
                                                            selectedCurrency.code,
                                                            lang
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right font-semibold text-foreground">
                                                {formatPrice(
                                                    finalPrice * item.quantity * selectedCurrency.exchange_rate,
                                                    selectedCurrency.code,
                                                    lang
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    {t('Shipping Information')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />

                                    <div className="space-y-1 text-sm">
                                        <p><strong>{t("Recipient")}:</strong> {order.address_info.recipient_name}</p>
                                        <p><strong>{t("Address")}:</strong> {order.address_info.address}</p>
                                        <p><strong>{t("City")}:</strong> {order.address_info.city}</p>

                                        {order.address_info.notes && (
                                            <p><strong>{t("Notes")}:</strong> {order.address_info.notes}</p>
                                        )}

                                        {order.address_info.latitude && order.address_info.longitude && (
                                            <a
                                                href={`https://www.google.com/maps?q=${order.address_info.latitude},${order.address_info.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-primary hover:underline"
                                            >
                                                📍 {t("View on map")}
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-muted-foreground">{t('Contact')}</p>
                                        <p className="text-foreground">{order.address_info.phone_number}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                    </div>

                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    {t('Order Summary')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {isorder && (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md dark:bg-amber-950 dark:border-amber-800 mb-3">
                                        <div className="flex items-start gap-2">
                                            <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                            <p className="text-amber-800 dark:text-amber-400 text-xs">
                                                {t('Pre-order payment will be processed when items are ready to ship.')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('Subtotal')}</span>
                                    <span>{formatPrice(order.subtotal * selectedCurrency.exchange_rate, selectedCurrency.code, lang)}</span>
                                </div>
                                {order.coupon && (order.discount_amount ?? 0) > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span>{t('Coupon')} ({order.coupon.code})</span>
                                        <span>-{formatPrice((order.discount_amount ?? 0) * selectedCurrency.exchange_rate, selectedCurrency.code, lang)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('Shipping')}</span>
                                    <span>{formatPrice(Number(order.delivery_amount) * selectedCurrency.exchange_rate, selectedCurrency.code, lang)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>{t('Total')}</span>
                                    <span className="text-2xl">
                                        {formatPrice(order.grand_total * selectedCurrency.exchange_rate, selectedCurrency.code, lang)}
                                    </span>
                                </div>
                                <div className="pt-3 text-muted-foreground">
                                    <p>{t('Payment Method')}: <strong>{t(order.payment_method)}</strong></p>
                                    <div>
                                        {t('Status')}:  {order.payment_status === 0 ? t('Pending') : t('Paid')}
                                    </div>
                                    {(order.notes && order.notes.length > 0) && (
                                        <div>
                                            {t('Your Notes')}: <em>{order.notes}</em>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-muted/50 border-muted">
                            <CardContent className="p-6 space-y-3">
                                <h3 className="font-semibold text-lg">{t('Need Help?')}</h3>
                                <p className="text-muted-foreground text-sm">
                                    {t("If you have questions about your order, we're here to help.")}
                                </p>
                                <Button variant="outline" asChild className="w-full justify-start">
                                    <Link to="/contact">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {t('Contact Support')}
                                    </Link>
                                </Button>

                                <Button asChild className="w-full justify-start">
                                    <Link to="/shop">
                                        <ArrowRight className="h-4 w-4 mr-2" />
                                        {t('Continue Shopping')}
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
