import BannerSlider from '@/components/home/BannerSlider';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import StaticFullPageSpinner from '@/components/StaticFullPageSpinner';
import GeneralError from '../Errors/GeneralError';
import ProductSection from '@/components/home/ProductSection';
import { HomeSection } from '@/types/api.interfaces';
import { useHome } from './hooks/useHome';

export default function Home() {
  const { data, isLoading, isError } = useHome();

  if (isLoading) {
    return <StaticFullPageSpinner />;
  }

  if (isError || !data || !Array.isArray(data.home_sections)) {
    return <GeneralError />;
  }
  return (
    <>
      <div className="page-content">
        {data.home_sections.map((section: HomeSection) => {
          switch (section.type) {
            case 'banner':
              return (
                <BannerSlider key={section.id} banners={section.banners} />
              );

            case 'product_section':
              return (
                <ProductSection
                  key={section.id}
                  sectionId={section.id}
                  title={section.title}
                  product_section_items={section.product_section_items || []}
                />
              );
            case 'category_section':
              return (
                <FeaturedCategories title={section.title} categories={section.categories || []} key={section.id} />
              );
            default:
              return null;
          }
        })}
      </div>
    </>
  );
}
