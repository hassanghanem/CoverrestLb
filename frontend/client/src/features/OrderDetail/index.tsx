import { Navigate, Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { Order } from '@/types/api.interfaces';
import {
    Package,
    Truck,
    MapPin,
    Phone,
    CreditCard,
    ArrowRight
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/utils/formatPrice';
import { getText } from '@/utils/getText';
import StaticFullPageSpinner from '@/components/StaticFullPageSpinner';
import { getOrderById } from '@/lib/services/order-service';
import { useQuery } from '@tanstack/react-query';
import { getOrderStatuses } from '@/utils/getOrderStatuses';

export default function OrderDetail() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language || "en";
    const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);

    const { orderId } = useParams<{ orderId: string }>();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["order", orderId],
        queryFn: () => getOrderById(Number(orderId)),
        enabled: !!orderId,
    });

    const order = data?.order as Order | undefined;

    if (isLoading) return <StaticFullPageSpinner />;
    if (isError || !order) return <Navigate to="/profile" replace />;

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
                    <h1 className="text-4xl font-bold mb-4">{t('Order Details')}</h1>
                    <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                        {t('Track your order and review all details below.')}
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="bg-background border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">{t('Order Number')}</p>
                            <p className="font-semibold text-lg">#{order.order_number}</p>
                        </div>
                        <div className="bg-background border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">{t('Status')}</p>
                            <Badge className={`${order.status_info.class}`}>{t(order.status_info.name)}</Badge>
                        </div>
                        <div className="bg-background border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">{t('Date')}</p>
                            <p className="font-semibold">
                                {new Date(order.created_at).toLocaleDateString(lang, {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="mb-8">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-6">{t('Order Progress')}</h3>
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
                                                    {item.variant.size && (
                                                        <span> • {t('Size')}: {getText(item.variant.size.name, lang)}</span>
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
                                        <p><strong>{t("Recipient")}:</strong> {order.address.recipient_name}</p>
                                        <p><strong>{t("Address")}:</strong> {order.address.address}</p>
                                        <p><strong>{t("City")}:</strong> {order.address.city}</p>

                                        {order.address.notes && (
                                            <p><strong>{t("Notes")}:</strong> {order.address.notes}</p>
                                        )}

                                        {order.address.latitude && order.address.longitude && (
                                            <a
                                                href={`https://www.google.com/maps?q=${order.address.latitude},${order.address.longitude}`}
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
                                    <span className="text-2xl">{formatPrice(order.grand_total * selectedCurrency.exchange_rate, selectedCurrency.code, lang)}</span>
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
