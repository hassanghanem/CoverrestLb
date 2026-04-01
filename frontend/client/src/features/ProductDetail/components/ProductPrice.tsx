import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/utils/formatPrice";
import { useTranslation } from "react-i18next";

interface ProductPriceProps {
  price: number;
  discount?: number;
}

const ProductPrice: React.FC<ProductPriceProps> = ({ price, discount = 0 }) => {
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);
  const { t, i18n } = useTranslation();

  const hasDiscount = discount > 0;
  const finalPriceNumber = hasDiscount ? price * (1 - discount / 100) : price;

  return (
    <div
      className="
        flex flex-wrap items-center gap-2
        max-w-full
        overflow-hidden
        wrap-break-word
      "
    >
      <span
        className="
          text-2xl sm:text-3xl md:text-4xl font-bold
          wrap-break-word
          leading-tight
        "
      >
        {formatPrice(
          finalPriceNumber * selectedCurrency.exchange_rate,
          selectedCurrency.code,
          i18n.language
        )}
      </span>

      {hasDiscount && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg sm:text-xl text-muted-foreground line-through">
            {formatPrice(
              price * selectedCurrency.exchange_rate,
              selectedCurrency.code,
              i18n.language
            )}
          </span>
          <Badge variant="destructive" className="whitespace-nowrap">
            {t("Save")}{" "}
            {formatPrice(
              (price - finalPriceNumber) * selectedCurrency.exchange_rate,
              selectedCurrency.code,
              i18n.language
            )}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default ProductPrice;
