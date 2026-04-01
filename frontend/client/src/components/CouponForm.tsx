import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { applyCoupon, removeCoupon } from '@/lib/services/coupon-service';
import { useFullPageLoading } from '@/context/FullPageLoadingContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tag, Gift } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useGetCoupons } from '@/hooks/usePublicData';

interface CouponFormProps {
  initialCoupon?: string;
}

export default function CouponForm({ initialCoupon = '' }: CouponFormProps) {
  const [coupon, setCoupon] = useState(initialCoupon);

  const queryClient = useQueryClient();
  const { setFullPageLoading, FullPageloading } = useFullPageLoading();
  const { t } = useTranslation();

  // Fetch first available coupon using the hook
  const { data: couponsResponse, isLoading: loadingSuggestion } = useGetCoupons(
    !initialCoupon ? { page: 1, per_page: 1 ,show_valid_only:true} : {}
  );

  // Get the first suggested coupon
  const suggestedCoupon = couponsResponse?.result && couponsResponse.coupons.length > 0 
    ? couponsResponse.coupons[0] 
    : null;

  const handleUseSuggestedCoupon = () => {
    if (suggestedCoupon) {
      setCoupon(suggestedCoupon.code);
    }
  };

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) {
      toast.warning(t('Please enter coupon code'));
      return;
    }
    setFullPageLoading(true);

    try {
      const response = await applyCoupon(coupon.trim());
      if (response.result) {
        queryClient.invalidateQueries({ queryKey: ['getCart'] });
      }
    } catch (error) {
      toast.error(t('Unexpected error'));
    }
    setFullPageLoading(false);
  };

  const handleRemoveCoupon = async () => {
    setFullPageLoading(true);
    try {
      const response = await removeCoupon();
      if (response.result) {
        queryClient.invalidateQueries({ queryKey: ['getCart'] });
        setCoupon('');
      }
    } catch (error) {
      toast.error(t('Unexpected error'));
    }
    setFullPageLoading(false);
  };

  const isInitialCoupon = !!initialCoupon && coupon === initialCoupon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tag className="w-5 h-5" />
          {t('Promo Code')} 
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Suggested Coupon Section */}
        {suggestedCoupon && !isInitialCoupon && !coupon && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {t('Try this coupon:')} <strong>{suggestedCoupon.code}</strong>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUseSuggestedCoupon}
                className="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
                disabled={FullPageloading || loadingSuggestion}
              >
                {t('Use')}
              </Button>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {suggestedCoupon.type === 'percentage' 
                ? `${suggestedCoupon.value}% ${t('discount')}`
                : `$${suggestedCoupon.value} ${t('off')}`
              }
            </p>
          </div>
        )}
        
        {isInitialCoupon ? (
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <span className="text-green-700 dark:text-green-300 font-medium">
              {t('Applied!')} {coupon}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveCoupon}
              className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
              disabled={FullPageloading}
            >
              {t('Remove')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder={t('Enter promo code')}
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="flex-1"
              disabled={FullPageloading || isInitialCoupon}
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={FullPageloading}
              className="w-full sm:w-auto"
            >
              {t('Apply')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
