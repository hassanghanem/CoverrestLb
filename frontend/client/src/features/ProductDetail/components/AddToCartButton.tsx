import { useFullPageLoading } from "@/context/FullPageLoadingContext";
import { addOrUpdateCartItem } from "@/lib/services/cart-service";
import { Product, Variant } from "@/types/api.interfaces";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";
import { ShoppingCart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AddToCartButtonProps {
  selectedVariant: Variant | undefined;
  selectedQuty: number;
  product: Product;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  selectedVariant,
  selectedQuty,
  product,
}) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { setFullPageLoading } = useFullPageLoading();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const handleClick = async () => {
    if (!isAuthenticated) {
      toast.warning(t("Please log in to add items to your cart."));
      localStorage.setItem('loginRedirect', location.pathname);
      navigate('/login', {
        replace: true,
      });

      return;
    }

    if (!selectedVariant) {
      toast.warning(t("Please select a valid color."));
      return;
    }

    setLoading(true);
    setFullPageLoading(true);

    try {
      const response = await addOrUpdateCartItem(selectedVariant.id, selectedQuty);
      if (response.result) {
        queryClient.invalidateQueries({ queryKey: ["getCart"] });
      }
    } catch (error) {
      toast.error(t("An unexpected error occurred. Please try again."));
    } finally {
      setLoading(false);
      setFullPageLoading(false);
    }
  };

  const isOutOfStock =
    selectedVariant?.available_quantity === 0 ||
    product.availability_status !== "available";

  const hasDiscount = selectedVariant?.discount && selectedVariant?.discount > 0;
  const variantPrice = selectedVariant?.price || 0;
  const finalPriceNumber = hasDiscount
    ? variantPrice - (variantPrice * selectedVariant.discount) / 100
    : variantPrice;

  const totalPrice = (finalPriceNumber * selectedQuty).toFixed(2);

  return (
    <div className="space-y-4">
      <Button
        size="lg"
        onClick={handleClick}
        disabled={!selectedVariant || loading}
        className={`w-full h-14 text-lg font-semibold flex items-center justify-center gap-2 rounded-xl transition-all
          ${isOutOfStock
            ? "bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md animate-pulse"
            : "bg-primary hover:bg-primary/90 text-white"
          }
        `}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            {t("Adding...")}
          </span>
        ) : isOutOfStock ? (
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t("Pre-Order")}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {t("Add To Cart")}
          </span>
        )}

        <span className="ml-2 text-base font-medium text-white/90">
          • ${totalPrice}
        </span>
      </Button>
    </div>
  );
};

export default AddToCartButton;
