import React from 'react';
import { HorizontalProductScroll } from '@/components/ui/horizontal-product-scroll';
import { ProductSectionItem } from '@/types/api.interfaces';
import { getText } from '@/utils/getText';
import { useTranslation } from 'react-i18next';

interface ProductSectionProps {
  sectionId: number;
  title: Record<string, string>;
  product_section_items: ProductSectionItem[];
}

const ProductSection: React.FC<ProductSectionProps> = ({ sectionId, title, product_section_items }) => {
  const {  i18n } = useTranslation();

  const products = product_section_items.map(item => item.product);

  const handleViewAll = () => {
    const newParams = new URLSearchParams();
    newParams.set('homeSections', sectionId.toString());
    return `/shop?${newParams.toString()}`
  };
  return (
    <section className=" bg-muted/30 px-4">
      <HorizontalProductScroll
        title={getText(title, i18n.language)}
        products={products}
        showAllLink={handleViewAll()}
      />
    </section>
  );
};

export default ProductSection;
