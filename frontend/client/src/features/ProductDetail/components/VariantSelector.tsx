import React, { useEffect } from 'react';
import { Color, Size, Variant } from '@/types/api.interfaces';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getText } from '@/utils/getText';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { formatPrice } from '@/utils/formatPrice';

interface VariantSelectorProps {
  variants: Variant[];
  selectedColor: Color | null;
  selectedSize: Size | null;
  selectedVariant: Variant | undefined;
  setSelectedColor: React.Dispatch<React.SetStateAction<Color | null>>;
  setSelectedSize: React.Dispatch<React.SetStateAction<Size | null>>;
  filteredColors: Color[];
  filteredSizes: Size[];
  colorLabelSize?: number;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedColor,
  setSelectedColor,
  filteredColors,
  colorLabelSize = 10,
  selectedSize,
  setSelectedSize,
  filteredSizes,
}) => {
  const { t, i18n } = useTranslation();
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);

  // Get available sizes for the selected color
  const availableSizesForColor = React.useMemo(() => {
    if (!selectedColor) return filteredSizes;

    const availableSizeIds = variants
      .filter((v: Variant) => v.color?.id === selectedColor.id && v.size)
      .map((v: Variant) => v.size!.id);

    return filteredSizes.filter(size => availableSizeIds.includes(size.id));
  }, [selectedColor, variants, filteredSizes]);

  useEffect(() => {
    if (!selectedColor && filteredColors.length > 0) {
      setSelectedColor(filteredColors[0]);
    }
  }, [filteredColors, selectedColor, setSelectedColor]);

  // Auto-select first available size when color changes or reset if no sizes available
  useEffect(() => {
    if (selectedColor) {
      if (availableSizesForColor.length > 0) {
        // If current selected size is not available for this color, select the first available
        if (!selectedSize || !availableSizesForColor.some(size => size.id === selectedSize.id)) {
          setSelectedSize(availableSizesForColor[0]);
        }
      } else {
        // No sizes available for this color, reset selection
        setSelectedSize(null);
      }
    }
  }, [selectedColor, availableSizesForColor, selectedSize, setSelectedSize]);

  const handleColorChange = (value: string) => {
    const color = filteredColors.find((color) => color.id.toString() === value);
    if (!color) return;
    setSelectedColor((prev) => (prev?.id === color.id ? null : color));
  };

  const handleSizeChange = (value: string) => {
    const size = availableSizesForColor.find((size) => size.id.toString() === value);
    if (size) {
      setSelectedSize(size);
    }
  };

  const getVariantPrice = (sizeId: number) => {
    if (!selectedColor) return null;
    const variant = variants.find(v => v.color?.id === selectedColor.id && v.size?.id === sizeId);
    if (!variant) return null;

    const hasDiscount = variant.discount > 0;
    const finalPrice = hasDiscount ? variant.price * (1 - variant.discount / 100) : variant.price;

    return formatPrice(
      finalPrice * selectedCurrency.exchange_rate,
      selectedCurrency.code,
      i18n.language
    );
  };

  return (
    <>
      {filteredColors.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-medium">{t('Color')}</Label>

          <RadioGroup
            value={selectedColor?.id.toString()}
            onValueChange={handleColorChange}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap gap-3">
              {filteredColors.map((color) => (
                <div key={color.id} className="flex items-center">
                  <RadioGroupItem
                    value={color.id.toString()}
                    id={`color-${color.id}`}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={`color-${color.id}`}
                    className={`w-${colorLabelSize} h-${colorLabelSize} rounded-full border-2 cursor-pointer transition-all ${selectedColor?.id === color.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-muted'
                      }`}
                    style={{ backgroundColor: color.code }}
                  />
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      )}
      {availableSizesForColor.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-medium">{t('Size')}</Label>

          <RadioGroup
            value={selectedSize?.id?.toString() ?? ""}
            onValueChange={handleSizeChange}
            className="flex flex-wrap gap-2"
          >
            {availableSizesForColor.map((size) => {
              const isSelected = selectedSize?.id === size.id;

              return (
                <div key={size.id}>
                  <RadioGroupItem
                    value={size.id.toString()}
                    id={`size-${size.id}`}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={`size-${size.id}`}
                    className={`
                      flex flex-col items-center justify-center min-w-[3.5rem] rounded-lg border px-3 py-1.5 cursor-pointer transition-all duration-200
                      min-h-[3rem] text-center
                      ${isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                        : "border-input bg-background hover:border-primary/40 hover:bg-accent/50"
                      }
                    `}
                  >
                    <span className="text-sm font-bold leading-none tracking-tight">
                      {getText(size.name, i18n.language)}
                    </span>
                    <span
                      className={`text-[10px] mt-1 font-medium leading-none ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                        }`}
                    >
                      {getVariantPrice(size.id)}
                    </span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

        </div>
      )}
    </>
  );
};

export default VariantSelector;
