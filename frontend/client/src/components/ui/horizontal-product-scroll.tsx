import React, { useRef } from 'react';
import { ProductCard } from '@/components/ui/product-card';
import { Product } from '@/types/api.interfaces';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';


interface HorizontalProductScrollProps {
  title?: string;
  products: Product[];
  showAllLink?: string;
  className?: string;
}

export const HorizontalProductScroll: React.FC<HorizontalProductScrollProps> = ({
  title,
  products,
  showAllLink,
  className = '',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  return (
    <section className={`py-4 ${className}`}>
      <div className="container mx-auto">
        {title && (
          <div className="mb-3">
            <h2 className="text-2xl lg:text-3xl font-bold">
              {title}
            </h2>
          </div>
        )}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="mobile-2-items"
              >
                <ProductCard
                  product={product}
                  className="h-full"
                />
              </div>
            ))}
          </div>
        </div>

        {showAllLink && (
          <div className="text-center mt-6">
            <Link
              to={showAllLink}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              {t('View All Products')}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
