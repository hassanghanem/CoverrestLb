import { Navigate, Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { Order } from '@/types/api.interfaces';

import {
    Clock,
    Package,
    Truck,
    MapPin,
    Phone,
    CreditCard,
    ArrowRight,
    Info
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/utils/formatPrice';
import { getText } from '@/utils/getText';
import StaticFullPageSpinner from '@/components/StaticFullPageSpinner';
import { useQuery } from '@tanstack/react-query';
import { getPreOrderById } from '@/lib/services/preorder-services';
import { getOrderStatuses } from '@/utils/getOrderStatuses';

export default function PreOrderDetail() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language || "en";
    const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);
    const { orderId } = useParams<{ orderId: string }>();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["preOrder", orderId],
        queryFn: () => getPreOrderById(Number(orderId)),
        enabled: !!orderId,
    });

    const pre_order = data?.order as Order | undefined;

    if (isLoading) return <StaticFullPageSpinner />;
    if (isError || !pre_order) return <Navigate to="/profile" replace />;

    const statuses = getOrderStatuses();
    const currentStatus = statuses.find((s) => s.id === pre_order.status);

    let timeline = statuses
        .filter((s) => [0, 1, 2, 4, 5].includes(s.id))
        .map((status) => ({
            ...status,
            state: status.id < pre_order.status ? 'completed' : status.id === pre_order.status ? 'current' : 'upcoming',
        }));

    if ([3, 6, 7, 8, 9, 10].includes(pre_order.status)) {
        timeline = [{ ...currentStatus!, state: 'special' }];
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-muted/20 to-background">
            <div className="container mx-auto py-10 lg:py-16 px-2">
                {/* Enhanced Header with Preorder Status */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Clock className="h-12 w-12 text-blue-600" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">{t('Preorder Details')}</h1>
                    <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                        {t('Your preorder is being processed. We will notify you when items are ready to ship.')}
                    </p>

                    {/* Preorder Status Badge */}
                    <div className="mb-6 flex justify-center">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800 px-4 py-2 text-base">
                            <Clock className="h-4 w-4 mr-2" />
                            {t('Preorder - Awaiting Stock')}
                        </Badge>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="bg-background border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">{t('Order Number')}</p>
                            <p className="font-semibold text-lg">#{pre_order.order_number}</p>
                        </div>
                        <div className="bg-background border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">{t('Status')}</p>
                            <Badge className={`${pre_order.status_info.class}`}>{t(pre_order.status_info.name)}</Badge>
                        </div>
                        <div className="bg-background border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">{t('Date')}</p>
                            <p className="font-semibold">
                                {new Date(pre_order.created_at).toLocaleDateString(lang, {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        {/* Add Expected Shipping Date if Available */}
                        {pre_order.expected_shipping_date && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-950 dark:border-blue-800">
                                <p className="text-sm text-blue-700 dark:text-blue-300">{t('Expected Shipping')}</p>
                                <p className="font-semibold text-blue-800 dark:text-blue-200">
                                    {new Date(pre_order.expected_shipping_date).toLocaleDateString(lang)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Order Progress with Preorder Timeline */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">{t('Preorder Progress')}</h3>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                <Info className="h-4 w-4 mr-1" />
                                {t('Preorder Timeline')}
                            </Badge>
                        </div>

                        {/* Preorder Specific Notice */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                        {t('Preorder Processing')}
                                    </h4>
                                    <p className="text-blue-700 dark:text-blue-400 text-sm">
                                        {t('Your preorder is confirmed and in queue. We will update this timeline as items become available for shipping.')}
                                    </p>
                                    {pre_order.estimated_ready_date && (
                                        <p className="text-blue-600 dark:text-blue-300 text-sm mt-2">
                                            <strong>{t('Estimated Ready Date:')}</strong>{' '}
                                            {new Date(pre_order.estimated_ready_date).toLocaleDateString(lang)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

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
                                            <h4
                                                className={`font-semibold ${step.state === 'upcoming' ? 'text-muted-foreground' : ''
                                                    }`}
                                            >
                                                {step.name}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-8 lg:grid-cols-2">
                    <div className="space-y-8">
                        {/* Enhanced Order Items with Preorder Badges */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    {t('Preorder Items')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 divide-y">
                                {pre_order.order_details.map((item) => {
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
                                                {pre_order?.coupon && item.product.coupon_eligible && (
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
                                        <p><strong>{t("Recipient")}:</strong> {pre_order.address.recipient_name}</p>
                                        <p><strong>{t("Address")}:</strong> {pre_order.address.address}</p>
                                        <p><strong>{t("City")}:</strong> {pre_order.address.city}</p>

                                        {pre_order.address.notes && (
                                            <p><strong>{t("Notes")}:</strong> {pre_order.address.notes}</p>
                                        )}

                                        {pre_order.address.latitude && pre_order.address.longitude && (
                                            <a
                                                href={`https://www.google.com/maps?q=${pre_order.address.latitude},${pre_order.address.longitude}`}
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
                                        <p className="text-foreground">{pre_order.address_info.phone_number}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        {/* Enhanced Order Summary with Preorder Payment Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    {t('Preorder Summary')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {/* Preorder Payment Information */}
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md dark:bg-amber-950 dark:border-amber-800">
                                    <div className="flex items-start gap-2">
                                        <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-medium text-amber-800 dark:text-amber-400 text-sm">
                                                {t('Preorder Payment')}
                                            </p>
                                            <p className="text-amber-700 dark:text-amber-500 text-xs mt-1">
                                                {pre_order.payment_status === 1
                                                    ? t('Your payment has been processed. You will be notified when items ship.')
                                                    : t('Payment will be processed when your preorder items are ready to ship.')
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('Subtotal')}</span>
                                    <span>{formatPrice(pre_order.subtotal * selectedCurrency.exchange_rate, selectedCurrency.code, lang)}</span>
                                </div>
                                {pre_order.coupon && (pre_order.discount_amount ?? 0) > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span>{t('Coupon')} ({pre_order.coupon.code})</span>
                                        <span>-{formatPrice((pre_order.discount_amount ?? 0) * selectedCurrency.exchange_rate, selectedCurrency.code, lang)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('Shipping')}</span>
                                    <span>{formatPrice(Number(pre_order.delivery_amount) * selectedCurrency.exchange_rate, selectedCurrency.code, lang)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>{t('Total')}</span>
                                    <span className="text-2xl">
                                        {formatPrice(pre_order.grand_total * selectedCurrency.exchange_rate, selectedCurrency.code, lang)}
                                    </span>
                                </div>
                                <div className="pt-3 text-muted-foreground">
                                    <p>{t('Payment Method')}: <strong>{t(pre_order.payment_method)}</strong></p>
                                    <div>
                                        {t('Status')}:  {pre_order.payment_status === 0 ? t('Pending') : t('Paid')}
                                    </div>
                                    {(pre_order.notes && pre_order.notes.length > 0) && (
                                        <div>
                                            {t('Your Notes')}: <em>{pre_order.notes}</em>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Enhanced Help Section with Preorder Support */}
                        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Info className="h-6 w-6 text-blue-600" />
                                    <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-300">{t('Preorder Support')}</h3>
                                </div>
                                <p className="text-blue-700 dark:text-blue-400 text-sm">
                                    {t('Have questions about your preorder? We are here to help with any inquiries about availability, timing, or modifications.')}
                                </p>
                                <div className="space-y-2">
                                    <Button variant="outline" asChild className="w-full justify-start bg-white dark:bg-blue-900">
                                        <Link to="/contact">
                                            <Phone className="h-4 w-4 mr-2" />
                                            {t('Contact Preorder Support')}
                                        </Link>
                                    </Button>
                                    <Button asChild className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                                        <Link to="/shop">
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                            {t('Browse More Products')}
                                        </Link>
                                    </Button>
                                </div>

                                {/* Preorder Cancellation Policy */}
                                <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
                                    <p className="text-xs text-blue-600 dark:text-blue-400">
                                        {t('Need to cancel? Preorders can be cancelled anytime before shipping.')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}