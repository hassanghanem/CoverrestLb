import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  X,
  Heart,
  ShoppingBag,
  Shield,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFullPageLoading } from "@/context/FullPageLoadingContext";
import { useGetCart, useGetWishlist } from "@/hooks/usePublicData";
import { addOrUpdateCartItem, removeCartItem } from "@/lib/services/cart-service";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState } from "@/lib/store/store";
import { addOrRemoveWishlistItem } from "@/lib/services/wishlist-service";
import { getText } from "@/utils/getText";
import ConfirmDialog from "@/components/ConfirmDialog";
import CouponForm from "@/components/CouponForm";
import { formatPrice } from "@/utils/formatPrice";
import { HorizontalProductScroll } from "@/components/ui/horizontal-product-scroll";

const Cart = () => {
  const { t, i18n } = useTranslation();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);

  const { data: cartData, refetch } = useGetCart(isAuthenticated);
  const [confirmItemId, setConfirmItemId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { setFullPageLoading } = useFullPageLoading();
  const cartItems = cartData?.cart?.items || [];
  const { data: wishlistData } = useGetWishlist(isAuthenticated, {});

  const updateQuantity = async (variantId: number, qty: number, maxQty?: number) => {
    // Validate max quantity
    if (maxQty && qty > maxQty) {
      toast.error(t("Cannot exceed maximum available quantity"));
      return;
    }

    setFullPageLoading(true);
    try {
      const response = await addOrUpdateCartItem(variantId, qty);
      if (response.result) {
        queryClient.invalidateQueries({ queryKey: ["getCart"] });
      }
    } catch (error) {
      toast.error(t("An unexpected error occurred. Please try again."));
    }
    setFullPageLoading(false);
  };

  const handleRemove = async () => {
    setFullPageLoading(true);
    if (confirmItemId) {
      const response = await removeCartItem(confirmItemId);
      if (response.result) {
        refetch();
      }
      setConfirmItemId(null);
    }
    setFullPageLoading(false);
  };

  const moveToWishlist = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFullPageLoading(true);
    const response = await addOrRemoveWishlistItem(id);
    if (response.result) {
      queryClient.invalidateQueries({ queryKey: ["getWishlist"] });
    }
    setFullPageLoading(false);
  };

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

      <div className="container mx-auto container-padding py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">{t("Shopping Cart")}</h1>
            <p className="text-muted-foreground mt-1">
              {cartItems.length} {cartItems.length !== 1 ? t("items") : t("item")} {t("in your cart")}
            </p>
          </div>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/shop">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Continue Shopping")}
            </Link>
          </Button>
        </div>
        {isPreOrder && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                  {t("Pre-order Cart")}
                </h3>
                <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                  {t("Items in your cart are pre-orders. Delivery dates will be confirmed after purchase.")}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <Card
                key={item.id}
                className="rounded-xl border shadow-sm"
              >
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  {/* Preorder Badge */}
                  {isPreOrder && (
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                        <Clock className="h-3 w-3" />
                        {t("Pre-order")}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {/* Image */}
                    <div className="shrink-0">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-32 lg:w-32 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={item.variant.images[0]?.image || item.product.images[0]?.image}
                          alt={getText(item.product.name, i18n.language)}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-2">
                      {/* Title + Remove */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5 lg:space-y-1">
                          <h3 className="text-sm font-semibold sm:text-base lg:text-lg leading-snug">
                            {getText(item.product.name, i18n.language)}
                          </h3>
                          <p className="text-xs lg:text-sm text-muted-foreground">
                            {item.product.brand?.name}
                          </p>
                          {(item.variant.color?.name || item.variant.size?.name) && (
                            <p className="text-[11px] lg:text-sm text-muted-foreground">
                              {item.variant.color?.name &&
                                `${t("Color")}: ${getText(item.variant.color.name, i18n.language)}`}
                              {item.variant.size?.name &&
                                ` · ${t("Size")}: ${getText(item.variant.size.name, i18n.language)}`}
                            </p>
                          )}
                          {cartData?.cart?.coupon && item.product.coupon_eligible && (
                            <p className="text-[11px] lg:text-sm text-green-600">
                              {t("Coupon applied to this item")}
                            </p>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setConfirmItemId(item.variant_id)}
                          className="h-8 w-8 lg:h-10 lg:w-10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Quantity + Price */}
                      <div className="flex items-center justify-between">
                        {/* Quantity */}
                        <div className="flex items-center rounded-lg border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 lg:h-10 lg:w-10"
                            onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <span className="w-8 text-center text-xs font-medium">
                            {item.quantity}
                          </span>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 lg:h-10 lg:w-10"
                            onClick={() => {
                              const maxQty =
                                item.product.max_order_quantity && item.product.max_order_quantity > 0
                                  ? item.product.max_order_quantity
                                  : item.variant?.available_quantity && item.variant.available_quantity > 0
                                    ? item.variant.available_quantity
                                    : undefined;
                              updateQuantity(item.variant_id, item.quantity + 1, maxQty);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right space-y-0.5 lg:space-y-1">
                          <p className="text-sm lg:text-xl font-bold">
                            {formatPrice(
                              Number(item.price) *
                              (1 - (item.discount ?? 0) / 100) *
                              item.quantity *
                              selectedCurrency.exchange_rate,
                              selectedCurrency.code,
                              i18n.language
                            )}
                          </p>

                          {item.discount > 0 && (
                            <p className="text-[11px] lg:text-sm text-muted-foreground line-through">
                              {formatPrice(
                                Number(item.price) *
                                item.quantity *
                                selectedCurrency.exchange_rate,
                                selectedCurrency.code,
                                i18n.language
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 lg:gap-3 pt-1">
                        {!wishlistData?.wishlist?.some(
                          (wishlist) => wishlist.product.id === item.product.id
                        ) && (
                            <Button
                              variant="outline"
                              className="h-7 px-2 text-[11px] lg:h-9 lg:px-4 lg:text-sm"
                              onClick={(e) => moveToWishlist(e, item.product.id)}
                            >
                              <Heart className="h-3 w-3 mr-1 lg:h-4 lg:w-4" />
                              {t("Wishlist")}
                            </Button>
                          )}

                        <Button
                          variant="outline"
                          asChild
                          className="h-7 px-2 text-[11px] lg:h-9 lg:px-4 lg:text-sm"
                        >
                          <Link to={`/product/${item.product.slug}`}>
                            {t("Details")}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4 lg:space-y-6">
            <CouponForm initialCoupon={cartData?.cart?.coupon?.code} />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("Order Summary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{t("Subtotal")}</span>
                    <span>
                      {formatPrice(
                        (cartData?.cart?.subtotal ?? 0) * selectedCurrency.exchange_rate,
                        selectedCurrency.code,
                        i18n.language
                      )}
                    </span>
                  </div>

                  {cartData?.cart?.coupon && cartData?.cart?.coupon?.coupon_type !== 4 &&
                    (cartData.cart.discount_amount ?? 0) > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>
                        {t("Promo Discount")} ({cartData.cart.coupon.code})
                      </span>
                      <span>
                        -{" "}
                        {formatPrice(
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
                        {formatPrice(
                          (cartData?.cart?.delivery_amount ?? 0) * selectedCurrency.exchange_rate,
                          selectedCurrency.code,
                          i18n.language
                        )}
                      </span>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>{t("Total")}</span>
                    <span>
                      {formatPrice(
                        (cartData?.cart?.grand_total ?? 0) * selectedCurrency.exchange_rate,
                        selectedCurrency.code,
                        i18n.language
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>{t("Secure checkout guaranteed")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>{t("Multiple payment options")}</span>
                  </div>
                </div>
                {isPreOrder && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md dark:bg-amber-950 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-amber-800 dark:text-amber-400 text-sm">
                        {t("This is a pre-order. You'll be notified when items are ready for shipping.")}
                      </p>
                    </div>
                  </div>
                )}
                <Button size="lg" className="w-full h-12 lg:h-14 text-base lg:text-lg font-bold" asChild>
                  <Link to="/checkout">
                    {isPreOrder ? t("Proceed to Pre-order") : t("Proceed to Checkout")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>

                <div className="text-center">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/shop">{t("Continue Shopping")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">{t("Secure Shopping")}</p>
                    <p className="text-muted-foreground">
                      {t("Your payment information is encrypted and secure. We never store your card details.")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {(cartItems.length > 0 && cartData?.related_products && cartData.related_products.length > 0) && (
        <HorizontalProductScroll
          className='mt-3 px-4'
          title={t("You may also like")}
          products={cartData.related_products}
        />
      )}
      <ConfirmDialog
        isOpen={confirmItemId !== null}
        title="Remove Item"
        message="Are you sure you want to remove this item from your cart?"
        onCancel={() => setConfirmItemId(null)}
        onConfirm={handleRemove}
        confirmText="Remove"
        cancelText="Cancel"
      />
    </>
  );
};

export default Cart;
