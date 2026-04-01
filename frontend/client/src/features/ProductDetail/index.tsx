import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Trash2, Plus, Edit, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StaticFullPageSpinner from '@/components/StaticFullPageSpinner';
import { useTranslation } from 'react-i18next';
import { useProductBySlug } from './hooks/useProductBySlug';
import { useProductVariants } from '@/hooks/useProductVariants';
import { useSettings } from '@/hooks/usePublicData';
import { getText } from '@/utils/getText';
import ProductPrice from './components/ProductPrice';
import ShareButton from './components/ShareButton';
import ProductWishlist from './components/ProductWishlist';
import VariantSelector from './components/VariantSelector';
import QtyInput from './components/QtyInput';
import AddToCartButton from './components/AddToCartButton';
import ProductImages from './components/ProductImages';
import { HorizontalProductScroll } from '@/components/ui/horizontal-product-scroll';
import { formatDistanceToNow, Locale } from 'date-fns';
import { enUS, arSA } from 'date-fns/locale';
import { useRateReviewLogic } from '@/hooks/useRateReviewLogic';
import ConfirmDialog from '@/components/ConfirmDialog';
import { RateReviewForm } from '@/components/RateReviewForm';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/ui/star-rating';
import NotFoundError from '../Errors/NotFoundError';

const localeMap: Record<string, Locale> = {
  en: enUS,
  ar: arSA,
};

const ProductDetail = () => {
  const { t, i18n } = useTranslation();
  const [selectedQty, setSelectedQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null);

  const { slug } = useParams<{ slug?: string }>();
  const { data, isLoading, isError } = useProductBySlug(slug ?? '');
  const { data: settingsData } = useSettings();
  const product = data?.product;
  const variants = useProductVariants(product?.variants || []);

  // Get WhatsApp contact number from configurations
  const configurations = settingsData?.configurations || [];
  const contact_phone = configurations.find(item => item.key === 'contact_phone')?.value;

  const {
    selectedReview,
    isDialogOpen,
    handleClose,
    handleSubmit,
    handleAddNew,
    handleEdit,
    handleDelete,
  } = useRateReviewLogic();

  const {
    selectedColor,
    setSelectedColor,
    filteredColors,
    selectedVariant,
    selectedSize,
    setSelectedSize,
    filteredSizes,
  } = variants;

  // Reset quantity when variant changes and current qty exceeds new max
  useEffect(() => {
    if (selectedVariant && product) {
      const newMaxQty =
        product.max_order_quantity && product.max_order_quantity > 0
          ? product.max_order_quantity
          : selectedVariant?.available_quantity &&
            selectedVariant.available_quantity > 0
            ? selectedVariant.available_quantity
            : Infinity;

      // For pre-order items (available_quantity = 0), don't reset quantity
      const isPreOrder = selectedVariant?.available_quantity === 0;

      if (!isPreOrder && selectedQty > newMaxQty) {
        setSelectedQty(Math.min(selectedQty, newMaxQty));
      }
    }
  }, [selectedVariant, product?.max_order_quantity, selectedQty, setSelectedQty, product]);

  if (isLoading) return <StaticFullPageSpinner />;
  if (!slug || isError || !product) return <NotFoundError />;

  const myReview = product.reviews.find((r) => r.is_mine);

  const confirmDelete = (id: number) => {
    setDeleteReviewId(id);
    setShowDeleteModal(true);
  };

  const onDeleteConfirmed = async () => {
    if (deleteReviewId !== null) {
      await handleDelete(deleteReviewId, product.slug);
    }
    setShowDeleteModal(false);
    setDeleteReviewId(null);
  };

  // WhatsApp direct order function
  const handleWhatsAppOrder = () => {
    if (!contact_phone || !selectedVariant) return;

    const productName = getText(product.name, i18n.language);
    const variantInfo = [];

    if (selectedColor) {
      variantInfo.push(`${t('Color')}: ${getText(selectedColor.name, i18n.language)}`);
    }

    if (selectedSize) {
      variantInfo.push(`${t('Size')}: ${getText(selectedSize.name, i18n.language)}`);
    }

    const variantDetails = variantInfo.length > 0 ? `\n${variantInfo.join(', ')}` : '';

    // Create product link for easy reference
    const productLink = `${window.location.origin}/product/${product.slug}`;

    // Use variant SKU if available, otherwise use product barcode
    const productIdentifier = selectedVariant?.sku || product.barcode;
    const identifierLabel = selectedVariant?.sku ? 'Variant SKU' : 'Product Barcode';

    const message = encodeURIComponent(
      `${t('Hello')}, ${t('I would like to order')}:\n\n` +
      `Product: ${productName}${variantDetails}\n` +
      `${t('Quantity')}: ${selectedQty}\n` +
      `${identifierLabel}: ${productIdentifier}\n` +
      `Product Link: ${productLink}\n\n` +
      `${t('Please confirm availability and total cost')}. ${t('Thank you')}!`
    );

    const whatsappUrl = `https://wa.me/${contact_phone.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto container-padding py-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/">{t("Home")}</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/shop?categories=${product.category?.id}`}>
              {getText(product.category?.name, i18n.language)}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{getText(product.name, i18n.language)}</span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto container-padding py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start lg:items-stretch">

          <ProductImages
            product={product}
            activeImage={activeImage}
            setActiveImage={setActiveImage}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            variants={product.variants}
          />

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge variant="secondary">
                    {getText(product.category?.name, i18n.language)}
                  </Badge>
                  <h1 className="text-3xl font-bold">
                    {getText(product.name, i18n.language)}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {t("by")} {product.brand?.name ?? ""}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <ProductWishlist product={product} />
                  <ShareButton title={getText(product.name, i18n.language)} />
                </div>
              </div>

              {product.short_description && getText(product.short_description, i18n.language) && (
                <p className="text-base text-muted-foreground leading-relaxed">
                  {getText(product.short_description, i18n.language)}
                </p>
              )}

              {product.warranty && getText(product.warranty, i18n.language) && (
                <p className="text-sm font-bold">
                  {t("Warranty")}: {getText(product.warranty, i18n.language)}
                </p>
              )}
              {/* Rating */}
              <div className="flex items-center space-x-4">
                <StarRating rating={product.average_rating} />
                <span className="text-muted-foreground">
                  ({product.reviews_count} {t("reviews")})
                </span>
              </div>

              <ProductPrice
                price={Number(selectedVariant?.price) || 0}
                discount={Number(selectedVariant?.discount) || 0}
              />
            </div>


            {/* Variant & Quantity */}
            <div className="space-y-6">
              <VariantSelector
                variants={product.variants}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                filteredColors={filteredColors}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                filteredSizes={filteredSizes}
                selectedVariant={selectedVariant}
              />

              <QtyInput
                minQty={product.min_order_quantity}
                maxQty={
                  // For pre-order items (available_quantity = 0), use product max or infinity
                  selectedVariant?.available_quantity === 0
                    ? (product.max_order_quantity && product.max_order_quantity > 0
                      ? product.max_order_quantity
                      : Infinity)
                    : (product.max_order_quantity && product.max_order_quantity > 0
                      ? product.max_order_quantity
                      : selectedVariant?.available_quantity &&
                        selectedVariant.available_quantity > 0
                        ? selectedVariant.available_quantity
                        : Infinity)
                }
                disableInput={!selectedVariant}
                qty={selectedQty}
                setQty={setSelectedQty}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <AddToCartButton
                selectedVariant={selectedVariant}
                selectedQuty={selectedQty}
                product={product}
              />

              {/* WhatsApp Direct Order Button */}
              {contact_phone && selectedVariant && (
                <Button
                  onClick={handleWhatsAppOrder}
                  variant="outline"
                  size="lg"
                  className="w-full border-green-500 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-600"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t('Order via WhatsApp')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <Tabs defaultValue={product.description && getText(product.description, i18n.language) ? "description" : "specifications"} className="w-full">
            <TabsList className={`grid w-full ${product.description && getText(product.description, i18n.language) ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {product.description && getText(product.description, i18n.language) && (
                <TabsTrigger value="description">{t("Description")}</TabsTrigger>
              )}
              <TabsTrigger value="specifications">{t("Specifications")}</TabsTrigger>
              <TabsTrigger value="reviews">
                {t("Reviews")} ({product.reviews_count})
              </TabsTrigger>
            </TabsList>

            {product.description && getText(product.description, i18n.language) && (
              <TabsContent value="description" className="mt-8">
                <div className="prose max-w-none">
                  <p className="text-lg leading-relaxed mb-6">
                    {getText(product.description, i18n.language)}
                  </p>
                </div>
              </TabsContent>
            )}

            <TabsContent value="specifications" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">
                      {getText(spec.description, i18n.language)}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-8">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">{product.average_rating.toFixed(1)}</div>
                    <div className="flex justify-center mb-2">
                      <StarRating rating={product.average_rating} />
                    </div>
                    <div className="text-muted-foreground">
                      {t("Based on")} {product.reviews_count} {t("reviews")}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = product.reviews.filter(r => Number(r.rating) === rating).length;
                      const percentage = product.reviews_count
                        ? Math.round((count / product.reviews_count) * 100)
                        : 0;
                      return (
                        <div key={rating} className="flex items-center space-x-3">
                          <span className="text-sm w-8">{rating}★</span>
                          <Progress value={percentage} className="flex-1" />
                          <span className="text-sm text-muted-foreground w-8">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
                    <h3 className="text-xl font-semibold">
                      {t("Reviews")} ({product.reviews_count})
                    </h3>

                    {myReview ? (
                      <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                        <Button
                          variant="secondary"
                          className="flex items-center justify-center gap-1 w-full sm:w-auto"
                          onClick={() => handleEdit(myReview)}
                        >
                          <Edit size={14} /> {t("Edit Your Review")}
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex items-center justify-center gap-1 w-full sm:w-auto"
                          onClick={() => confirmDelete(myReview.id)}
                        >
                          <Trash2 size={14} /> {t("Delete Your Review")}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="flex items-center justify-center gap-1 w-full sm:w-auto mt-2 sm:mt-0"
                        onClick={() => handleAddNew()}
                      >
                        <Plus size={14} /> {t("Add New Review")}
                      </Button>
                    )}
                  </div>

                  {product.reviews.length === 0 ? (
                    <p>{t("No reviews yet.")}</p>
                  ) : (
                    product.reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{review.client_name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <StarRating rating={review.rating} size="sm" />
                              <span className="text-sm text-muted-foreground">
                                {review.created_at
                                  ? formatDistanceToNow(new Date(review.created_at), {
                                    addSuffix: true,
                                    locale: localeMap[i18n.language] || enUS,
                                  })
                                  : t("Date Unknown")}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {data.related_products.length > 0 && (
          <HorizontalProductScroll
            className='mt-5'
            title={t("You may also like")}
            products={data.related_products}
          />
        )}
      </div>

      <RateReviewForm
        key={selectedReview ? `edit-${selectedReview.id}` : 'add'}
        product={product}
        isOpen={isDialogOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        initialData={selectedReview || undefined}
        isEdit={!!selectedReview}
      />

      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Delete Review"
        message="Are you sure you want to delete this review?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={onDeleteConfirmed}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default ProductDetail;
