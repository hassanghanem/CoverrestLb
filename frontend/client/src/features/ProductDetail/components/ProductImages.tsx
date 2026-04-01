import React, { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import VisuallyHidden from "@/components/ui/VisuallyHidden";
import { ZoomIn, X } from "lucide-react";
import { getText } from "@/utils/getText";
import { useTranslation } from "react-i18next";
import { Product, Variant, Color, Size } from "@/types/api.interfaces";

interface ProductImagesProps {
  product: Product;
  activeImage: number;
  setActiveImage: (index: number) => void;
  selectedColor?: Color | null;
  selectedSize?: Size | null;
  variants?: Variant[];
}

const ProductImages: React.FC<ProductImagesProps> = ({
  product,
  activeImage,
  setActiveImage,
  selectedColor,
  selectedSize,
  variants = [],
}) => {
  const { t, i18n } = useTranslation();
  const [zoom, setZoom] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  /** ---------- IMAGE SOURCE LOGIC ---------- */
  const imagesToDisplay = useMemo(() => {
    if (!selectedColor) return product.images || [];

    let match =
      variants.find(
        (v) =>
          v.color?.id === selectedColor.id &&
          v.size?.id === selectedSize?.id
      ) ||
      (!selectedSize &&
        variants.find((v) => v.color?.id === selectedColor.id && !v.size)) ||
      variants.find((v) => v.color?.id === selectedColor.id);

    return match?.images?.length
      ? match.images.map((i) => ({ image: i.image }))
      : product.images || [];
  }, [product.images, selectedColor, selectedSize, variants]);

  /** Reset active image if index is out of bounds */
  useEffect(() => {
    if (activeImage >= imagesToDisplay.length) setActiveImage(0);
  }, [imagesToDisplay, activeImage]);

  const activeImg = imagesToDisplay?.[activeImage]?.image;


  return (
    <div className="flex flex-col h-full space-y-4">
      {/* ---------- MAIN IMAGE ---------- */}
      <div className="relative w-full mx-auto max-w-[480px] rounded-xl overflow-hidden aspect-[3/4] shadow-sm p-1">
        {activeImg ? (
          <img
            src={activeImg}
            alt={getText(product.name, i18n.language)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            {t("No image available")}
          </div>
        )}

        <Button
          size="icon"
          variant="secondary"
          onClick={() => setZoom(true)}
          className="absolute top-3 right-3 shadow-sm "
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      {/* ---------- THUMBNAILS (HORIZONTAL SCROLL) ---------- */}
      {imagesToDisplay.length > 1 && (
        <div
          ref={thumbsRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-1 max-w-[480px] mx-auto"
        >
          {imagesToDisplay.map((img, i) => (
            <button
              key={i}
              onClick={() => {
                const container = thumbsRef.current;
                if (!container) return;
                const thumb = container.children[i] as HTMLElement;
                thumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                setActiveImage(i);
              }}
              className={`flex-shrink-0 w-16 aspect-[3/4] rounded-md overflow-hidden border transition-all duration-200 relative p-1 ${i === activeImage
                  ? "border-primary shadow-md scale-105"
                  : "border-border hover:scale-105"
                }`}
            >
      
              <img
                src={img.image}
                alt=""
                className="w-full h-full object-cover"
             
              />
            </button>
          ))}
        </div>
      )}

      {/* ---------- ZOOM MODAL ---------- */}
      <Dialog open={zoom} onOpenChange={setZoom} >
        <DialogContent className="p-4 max-w-3xl bg-transparent border-none shadow-none" >
          <DialogTitle>
            <VisuallyHidden>{getText(product.name, i18n.language) || "Product image zoom modal"}</VisuallyHidden>
          </DialogTitle>
          <div className="relative">
    
            <img
              src={activeImg}
              alt=""
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />

            {/* Only one close button */}
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setZoom(false)}
              className="absolute top-4 right-4  shadow-sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductImages;
