import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface QtyInputProps {
  minQty?: number;
  maxQty?: number;
  qty: number;
  setQty: (qty: number) => void;
  disableInput?: boolean;
}

const QtyInput: React.FC<QtyInputProps> = ({
  minQty = 1,
  maxQty = Infinity,
  qty,
  setQty,
  disableInput = false,
}) => {
  const { t } = useTranslation();

  const increment = () => {
    if (qty < maxQty) setQty(Math.min(qty + 1, maxQty));
  };

  const decrement = () => {
    if (qty > minQty) setQty(Math.max(qty - 1, minQty));
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">{t("Quantity")}</Label>

      <input
        type="number"
        id="qty"
        name="qty"
        value={qty}
        min={minQty}
        max={maxQty === Infinity ? undefined : maxQty}
        readOnly
        hidden
      />

      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="icon"
          onClick={decrement}
          disabled={disableInput || qty <= minQty}
          aria-label={t("Decrease quantity")}
        >
          <Minus className="w-4 h-4" />
        </Button>

        <span className="w-12 text-center font-medium">{qty}</span>

        <Button
          variant="outline"
          size="icon"
          onClick={increment}
          disabled={disableInput || qty >= maxQty}
          aria-label={t("Increase quantity")}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default QtyInput;
