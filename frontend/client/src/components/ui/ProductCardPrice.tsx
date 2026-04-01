import { RootState } from "@/lib/store/store";
import React from "react";
import { useSelector } from "react-redux";
import { formatPrice } from "@/utils/formatPrice";
import { useTranslation } from "react-i18next";

interface ProductCardPriceProps {
  price: number;
  discount?: number;
}

const ProductCardPrice: React.FC<ProductCardPriceProps> = ({ price, discount = 0 }) => {
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);
  const { i18n } = useTranslation();

  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount ? price * (1 - discount / 100) : price;

  return (
    <div
      className="
        flex flex-wrap items-center gap-2
        max-w-full
        overflow-hidden
        break-words
        pt-1
      "
    >
      <span
        className="
          text-base sm:text-lg md:text-xl
          font-bold
          break-words leading-tight
        "
      >
        {formatPrice(
          finalPrice * selectedCurrency.exchange_rate,
          selectedCurrency.code,
          i18n.language
        )}
      </span>

      {hasDiscount && (
        <span
          className="
            text-sm sm:text-base
            text-muted-foreground line-through
            break-words
          "
        >
          {formatPrice(
            price * selectedCurrency.exchange_rate,
            selectedCurrency.code,
            i18n.language
          )}
        </span>
      )}
    </div>
  );
};

export default ProductCardPrice;
