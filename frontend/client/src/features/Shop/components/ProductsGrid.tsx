import { ProductCard } from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import StaticFullPageSpinner from '@/components/StaticFullPageSpinner';
import { useTranslation } from 'react-i18next';

interface ProductsGridProps {
  products: any[];
  resetFilters: () => void;
  isLoading: boolean;
}

const ProductsGrid = ({ products, resetFilters, isLoading }: ProductsGridProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return <StaticFullPageSpinner />;
  }

  if (products.length > 0) {
    return (
      <div className={`grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="text-muted-foreground mb-4">
        {t("No products found matching your criteria.")}
      </div>
      <Button onClick={resetFilters}>
        {t("Clear All Filters")}
      </Button>
    </div>
  );
};

export default ProductsGrid;
