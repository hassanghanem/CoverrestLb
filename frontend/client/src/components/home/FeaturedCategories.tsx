import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Link } from 'react-router-dom';
import { Category } from '@/types/api.interfaces';
import { useTranslation } from 'react-i18next';
import { getText } from '@/utils/getText';

interface FeaturedCategoriesProps {
  categories: Category[];
  title: Record<string, string>;
}

const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ title, categories }) => {
  const { i18n } = useTranslation();

  return (
    <section className="bg-background py-1 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {getText(title, i18n.language)}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4 lg:gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/shop?categories=${category.id}`}
              className="group block"
            >
              <div
                className={`
                  relative overflow-hidden rounded-xl 
                  bg-white dark:bg-card border border-border/50 
                  shadow-sm hover:shadow-lg hover:border-primary/20
                  transition-all duration-300 ease-in-out 
                  transform hover:-translate-y-1
                  animate-fade-in
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <AspectRatio ratio={3 / 2}>
                  <div className="relative w-full h-full">
                    <img
                      src={category.image}
                      alt={getText(category.name, i18n.language)}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-2 sm:p-4 md:p-6 lg:p-8 text-white">
                      <div className="space-y-2 text-center">
                        <h3 className="sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold drop-shadow-md leading-tight">
                          {getText(category.name, i18n.language)}
                        </h3>
                      </div>


                    </div>
                  </div>
                </AspectRatio>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
