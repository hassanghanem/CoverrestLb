import { Link } from 'react-router-dom';
import {
  Lock,
  ArrowLeft,
  Shield,
  Calendar,
  MapPin,
  Heart,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/lib/store/store';
import { useSelector } from 'react-redux';
import { formatPrice } from '@/utils/formatPrice';
import { getText } from '@/utils/getText';
import { AddressForm } from '@/components/AddressFormDialog';
import { useCheckoutLogic } from './hooks/useCheckoutLogic';
import StaticFullPageSpinner from '@/components/StaticFullPageSpinner';
import AddressCard from '@/components/AddressCard';
import CouponForm from '@/components/CouponForm';

const Checkout = () => {
  const { t, i18n } = useTranslation();
  const {
    isCartLoading,
    cartData,
    address,
    allAddresses,
    selectedAddressId,
    setSelectedAddressId,
    isDialogOpen,
    handleSubmit,
    handleCheckOut,
    handleClose,
    paymentMethod,
    setPaymentMethod,
    orderNotes,
    setOrderNotes,
    isEditingDefaultAddress,
    openEditAddress,
    openAddAddress,
    paymentMethods,
    delivery_duration
  } = useCheckoutLogic();
  const cartItems = cartData?.cart?.items || [];
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);

  if (isCartLoading) return <StaticFullPageSpinner />;
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="container mx-auto container-padding">
          <div className="text-center max-w-md mx-auto space-y-8">
            <div className="w-32 h-32 bg-muted rounded-full mx-auto flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">{t("Your cart is empty")}</h1>
              <p className="text-muted-foreground text-lg">
                {t("Looks like you haven't added anything to your cart yet.")}
              </p>
            </div>
            <div className="space-y-4">
              <Button size="lg" className="w-full h-14" asChild>
                <Link to="/shop">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {t("Start Shopping")}
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full h-14" asChild>
                <Link to="/wishlist">
                  <Heart className="w-5 h-5 mr-2" />
                  {t("View Wishlist")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const isPreOrder = cartData?.cart?.is_preorder;
  return (
    <>
      <div className="container mx-auto container-padding py-6 lg:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold lg:text-3xl">{t("Checkout")}</h1>
            <p className="text-sm text-muted-foreground lg:text-base">
              {t("Review your order and complete your details.")}
            </p>
          </div>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("Back to cart")}
            </Link>
          </Button>
        </div>
        {isPreOrder && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                  {t("Pre-order Purchase")}
                </h3>
                <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                  {t("You are purchasing pre-order items. Delivery dates will be confirmed via email once products are ready to ship.")}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-8">
          <div className="space-y-6">

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center justify-between gap-2 text-lg">
                  <div className='flex items-center gap-2 text-lg'>
                    <MapPin className="w-5 h-5" />
                    {t("Shipping Address")}
                  </div>
                  <Button onClick={e => { e.preventDefault(); openAddAddress(); }}>
                    {t("Add New Address")}
                  </Button>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("Double-check the delivery location so we can get your order to you without delays.")}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {allAddresses.length > 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="address-select">{t("Select Address")}</Label>
                    <Select
                      value={selectedAddressId?.toString() || "default"}
                      onValueChange={(value) => setSelectedAddressId(value === "default" ? null : parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("Choose an address")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">
                          {allAddresses.find(addr => addr.is_default)?.address 
                            ? `${allAddresses.find(addr => addr.is_default)?.address} (${t("Default")})` 
                            : t("Default Address")}
                        </SelectItem>
                        {allAddresses
                          .filter(addr => !addr.is_default)
                          .map((addr) => (
                            <SelectItem key={addr.id} value={addr.id.toString()}>
                              {`${addr.city}, ${addr.address} (${addr.recipient_name})`}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {address && <AddressCard address={address} onEdit={openEditAddress} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-semibold">{t("Payment")}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("All transactions are secured with 256-bit encryption.")}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value)}
                  className="space-y-3"
                >
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border rounded-lg p-3 lg:p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-xl lg:text-2xl">
                                {typeof method.icon === 'string' ? (
                                  method.icon.startsWith('/') ? (
                                    <img src={method.icon} alt={method.name} className="w-6 h-6 lg:w-8 lg:h-8" />
                                  ) : (
                                    <span>{method.icon}</span>
                                  )
                                ) : null}
                              </div>
                              <div>
                                <div className="font-medium">{method.name}</div>
                                <div className="text-sm text-muted-foreground">{method.description}</div>
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-semibold">{t("Order preferences")}</CardTitle>
                <p className="text-sm text-muted-foreground">{t("Optional details to help us deliver exactly how you like.")}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="specialInstructions">{t("Delivery notes")}</Label>
                    <Textarea
                      id="specialInstructions"
                      value={orderNotes}
                      onChange={e => setOrderNotes(e.target.value)}
                      placeholder={t("Leave at the front desk, ring the bell, etc.")}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="lg:sticky lg:top-10 lg:h-fit">
            <CouponForm  initialCoupon={cartData?.cart?.coupon?.code} />
            <Card className="mt-5">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-semibold">{t("Order summary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {isPreOrder && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md dark:bg-amber-950 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-amber-800 dark:text-amber-400 text-sm font-medium">
                          {t("Pre-order Items")}
                        </p>
                        <p className="text-amber-700 dark:text-amber-500 text-xs mt-1">
                          {t("These items will ship once available. You'll receive updates on expected delivery dates.")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img src={item.variant.images[0]?.image || item.product.images[0]?.image} alt={getText(item.product.name, i18n.language)} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm truncate">{getText(item.product.name, i18n.language)}</h4>
                        {item.variant.color?.name && (
                          <h5 className="font-medium text-sm truncate">{t("Color")}: {getText(item.variant.color?.name, i18n.language)}</h5>
                        )}
                            {item.variant.size?.name && (
                          <h5 className="font-medium text-sm truncate">{t("Size")}: {getText(item.variant.size?.name, i18n.language)}</h5>
                        )}
                        <p className="text-sm text-muted-foreground">{t("Qty")}: {item.quantity}</p>
                        {cartData?.cart?.coupon && item.product.coupon_eligible && (
                          <p className="text-xs text-green-600">
                            {t("Coupon applied to this item")}
                          </p>
                        )}
                        <p className="font-bold text-sm">{formatPrice((item.variant.price * (1 - (item.discount ?? 0) / 100) * item.quantity) * selectedCurrency.exchange_rate, selectedCurrency.code, i18n.language)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t("Subtotal")}</span>
                    <span>{formatPrice((cartData?.cart?.subtotal ?? 0) * selectedCurrency.exchange_rate, selectedCurrency.code, i18n.language)}</span>
                  </div>
                  {cartData?.cart?.coupon && cartData?.cart?.coupon?.coupon_type !== 4 &&
                    (cartData.cart.discount_amount ?? 0) > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>{t("Promo Discount")} ({cartData.cart.coupon.code})</span>
                      <span>
                        -{formatPrice(
                          (cartData.cart.discount_amount ?? 0) * selectedCurrency.exchange_rate,
                          selectedCurrency.code,
                          i18n.language
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{t("Shipping")}</span>
                    {cartData?.cart?.delivery_amount === 0 ? (
                      <span className="text-green-600 dark:text-green-400">{t("FREE")}</span>
                    ) : (
                      <span>
                        {cartData?.cart?.delivery_amount == 0 ? t("Free Shipping") : <>{formatPrice((cartData?.cart?.delivery_amount ?? 0) * selectedCurrency.exchange_rate, selectedCurrency.code, i18n.language)}</>}
                      </span>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-base font-semibold">
                    <span>{t("Total due")}</span>
                    <span>{formatPrice((cartData?.cart?.grand_total ?? 0) * selectedCurrency.exchange_rate, selectedCurrency.code, i18n.language)}</span>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
                  {t("Need to make a change? You can update quantities on the cart page before placing your order.")}
                </div>
                {isPreOrder ? (
                  <div className="rounded-lg border bg-blue-50 border-blue-200 p-3 text-sm text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t("Pre-order Item")}
                    </div>
                    <p className="mt-1 text-xs">
                      {t("Delivery date will be confirmed via email when items are ready to ship")}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                    <div className="mt-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t("Estimated arrival")}: {delivery_duration} {Number(delivery_duration) === 1 ? t("day") : t("days")}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-6 w-6" />
                  {t("Payments are secured and encrypted. You can review your order before placing it.")}
                </div>
                <Button type="button" size="lg" className="w-full sm:w-auto" onClick={handleCheckOut}>
                  <Lock className="mr-2 h-4 w-4" />
                  {isPreOrder ? t("Place Pre-order") : t("Place order")}
                </Button>
              </CardContent>
            </Card>

          </aside>
        </div>
      </div>

      <AddressForm
        key={isEditingDefaultAddress ? `edit-${address?.id}` : 'add'}
        isOpen={isDialogOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        initialData={isEditingDefaultAddress ? address : undefined}
        isEdit={isEditingDefaultAddress}
      />
    </>
  );
};

export default Checkout;
