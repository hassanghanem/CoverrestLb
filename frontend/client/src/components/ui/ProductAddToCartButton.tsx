import { useFullPageLoading } from "@/context/FullPageLoadingContext";
import { addOrUpdateCartItem } from "@/lib/services/cart-service";
import { Product, Variant } from "@/types/api.interfaces";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";
import { Clock, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "./spinner";
import { useNavigate } from "react-router-dom";


interface ProductAddToCartButtonProps {
  selectedVariant: Variant | undefined;
  selectedQuty: number;
  product: Product;
}

const ProductAddToCartButton: React.FC<ProductAddToCartButtonProps> = ({
  selectedVariant,
  selectedQuty,
  product,
}) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { setFullPageLoading } = useFullPageLoading();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warning(t("Please log in to add items to your cart."));
      localStorage.setItem('loginRedirect', location.pathname);
      navigate('/login', {
        replace: true,
      });

      return;
    }

    if (!selectedVariant) {
      toast.warning(t("Please select a valid color and size."));
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

  return (
    <Button
      size="icon"
      className={`w-full h-9 text-sm font-medium transition-all rounded-xl flex items-center justify-center gap-2
        ${isOutOfStock
          ? "bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md animate-pulse"
          : "bg-primary hover:bg-primary/90 text-white"
        }
      `}
      onClick={handleClick}
      disabled={!selectedVariant}
    >
      {loading ? (
        <Spinner size="sm" />

      ) : isOutOfStock ? (
        <>
          <Clock className="w-4 h-4" />
          <span>{t("Preorder")}</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          <span>{t("Add To Cart")}</span>
        </>
      )}
    </Button>
  );
};

export default ProductAddToCartButton;
