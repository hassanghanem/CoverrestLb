import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Product } from "@/types/api.interfaces";
import ProductStatus from "./ProductStatus";
import { getText } from "@/utils/getText";
import { useTranslation } from "react-i18next";
import ProductCardPrice from "./ProductCardPrice";
import ProductWishlistCard from "./ProductWishlistCard";
import StarRating from "./star-rating";
import { Label } from "./label";

interface ProductCardProps {
  product: Product;
  className?: string;
  viewMode?: "grid" | "list";
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = "",
  viewMode = "grid",
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card
      className={`
        group relative overflow-hidden rounded-xl border border-border/40
         dark:bg-card hover:border-primary/40 hover:shadow-lg 
        transition-all duration-300
         ease-in-out 
                  transform hover:-translate-y-1
                  animate-fade-in
        ${viewMode === 'grid' ? 'w-full' : 'flex flex-row'}

        ${className}
      `}
    >
      <CardContent
        onClick={() => navigate(`/product/${product.slug}`)}
        className={`p-0 cursor-pointer flex
          ${viewMode === "list" ? "flex-row w-full" : "flex-col"}
        `}
      >
        {/* ---------------- IMAGE (4:5) ---------------- */}
        <div
          className={`
            relative overflow-hidden bg-gray-100 dark:bg-gray-700 
            shrink-0 
            ${viewMode === "list" ? "w-32 xs:w-36 sm:w-44 md:w-52 lg:w-60 aspect-[4/5]" : "aspect-[4/5] w-full"}
          `}
        >
          {product.image ? (
            <img
              loading="lazy"
              src={product.image}
              alt={getText(product.name, i18n.language)}
              className={`
                w-full h-full object-cover transition-all duration-500
                group-hover:scale-105
                ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}
              `}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <ShoppingCart className="w-8 h-8 mb-2" />
              <span className="text-xs font-medium">
                {getText(product.category?.name, i18n.language)}
              </span>
            </div>
          )}

          {/* Status + Wishlist */}
          <div className="absolute top-2 left-2 z-10">
            <ProductStatus status={product.availability_status as any} />
          </div>

          <div className="absolute top-2 right-2 z-10">
            <ProductWishlistCard product={product} />
          </div>
        </div>

        {/* ---------------- INFO AREA ---------------- */}
        <div
          className={`
            flex flex-col 
            ${viewMode === "list" ? "flex-1 p-3 xs:p-4 sm:p-5 md:p-6 justify-between min-w-0" : "p-3 gap-2"}
          `}
        >
          <div className={`flex flex-col ${viewMode === "list" ? "gap-2 sm:gap-3" : "gap-2"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] xs:text-xs text-muted-foreground uppercase font-medium tracking-wide truncate">
                {getText(product.category?.name, i18n.language)}
              </span>

              <div className="flex items-center gap-0.5 xs:gap-1 shrink-0">
                <StarRating rating={product.average_rating} size="sm" />
                <span className="text-[10px] xs:text-xs text-muted-foreground hidden xs:inline">
                  ({product.reviews_count})
                </span>
              </div>
            </div>

            {/* Name */}
            <h2
              className={`
                font-semibold leading-tight 
                hover:text-primary transition-colors
                ${viewMode === "list" ? "text-sm xs:text-base sm:text-lg md:text-xl line-clamp-2" : "text-base line-clamp-2 min-h-[36px]"}
              `}
            >
              {getText(product.name, i18n.language)}
            </h2>

            {/* Short Description — LIST ONLY */}
            {viewMode === "list" && product.short_description && (
              <p className="text-md text-muted-foreground line-clamp-2 leading-relaxed hidden xs:block">
                {getText(product.short_description, i18n.language)}
              </p>
            )}

            {/* Warranty */}
            {product.warranty && getText(product.warranty, i18n.language) && (
              <p className="text-xs xs:text-sm font-semibold text-foreground">
                {t("Warranty")}: {getText(product.warranty, i18n.language)}
              </p>
            )}

            {/* Color Variants */}
            {viewMode === "list" && product.variants && product.variants.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 xs:gap-2">
                <div className="flex flex-wrap gap-1.5 xs:gap-2">
                  {Array.from(
                    new Map(
                      product.variants
                        .filter((variant) => variant.color?.code)
                        .map((variant) => [variant.color!.code, variant])
                    ).values()
                  )
                    .map((variant) => (
                      <div key={variant.color!.code} className="flex items-center">
                        <Label
                          htmlFor={`color-${variant.id}`}
                          className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full border-2 cursor-pointer transition-all hover:scale-110 hover:border-primary`}
                          style={{ backgroundColor: variant.color?.code }}
                        />
                      </div>
                    ))}

                </div>
              </div>
            )}

            {viewMode === "grid" && (
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  new Map(
                    product.variants
                      .filter((variant) => variant.color?.code)
                      .map((variant) => [variant.color!.code, variant])
                  ).values()
                ).map((variant) => (
                  <div key={variant.color!.code} className="flex items-center">
                    <Label
                      htmlFor={`color-${variant.id}`}
                      className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-all`}
                      style={{ backgroundColor: variant.color?.code }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price - Bottom aligned in list view */}
          <div className={viewMode === "list" ? "mt-auto pt-2 xs:pt-3 sm:pt-4" : ""}>
            <ProductCardPrice
              price={Number(product.price) || 0}
              discount={Number(product.discount) || 0}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
