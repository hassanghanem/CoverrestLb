import { useState, useEffect } from 'react';
import { Color, Size, Variant } from '@/types/api.interfaces';

export function useProductVariants(variants: Variant[]) {
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);

  const colors: Color[] = Array.from(
    new Map(
      variants
        .filter(v => v.color)
        .map(v => [v.color!.id, { ...v.color! }])
    ).values()
  ).sort((a, b) => a.id - b.id);

  const sizes: Size[] = Array.from(
    new Map(
      variants
        .filter(v => v.size)
        .map(v => [v.size!.id, { ...v.size! }])
    ).values()
  ).sort((a, b) => a.id - b.id);



  const filteredColors: Color[] = colors.filter(color =>
    variants.some(v => v.color?.id === color.id)
  );
  const filteredSizes: Size[] = sizes.filter(size =>
    variants.some(v => v.size?.id === size.id)
  );

  const selectedVariant: Variant | undefined = variants.find(v => {
    const colorMatch = v.color ? selectedColor?.id === v.color.id : !v.color;
    const sizeMatch = v.size ? selectedSize?.id === v.size.id : !v.size;
    return colorMatch && sizeMatch;
  });

  useEffect(() => {
    if (filteredColors.length > 0) {
      setSelectedColor(filteredColors[0]);
    } else {
      setSelectedColor(null);
    }
  }, [variants]);

  useEffect(() => {
    if (filteredSizes.length > 0) {
      setSelectedSize(filteredSizes[0]);
    } else {
      setSelectedSize(null);
    }
  }, [variants]);

  // Auto-select size when color changes if there's only one size for that color
  useEffect(() => {
    if (selectedColor) {
      const sizesForColor = variants
        .filter(v => v.color?.id === selectedColor.id)
        .map(v => v.size)
        .filter(Boolean);

      const uniqueSizesForColor = Array.from(
        new Map(sizesForColor.map(size => [size!.id, size])).values()
      );

      if (uniqueSizesForColor.length === 1) {
        setSelectedSize(uniqueSizesForColor[0]);
      } else if (uniqueSizesForColor.length === 0) {
        setSelectedSize(null);
      }
    }
  }, [selectedColor, variants]);

  const resetSelection = () => setSelectedColor(null);


  return {
    colors,
    selectedColor,
    setSelectedColor,
    filteredColors,
    selectedVariant,
    resetSelection,
    sizes,
    selectedSize,
    setSelectedSize,
    filteredSizes,
  };
}
