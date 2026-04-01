import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getText } from '@/utils/getText';
import { Category, Color, Brand, FilterHomeSection, Size } from '@/types/api.interfaces';
import { useTranslation } from 'react-i18next';

interface FiltersContentProps {
  categories: Category[];
  colors: Color[];
  sizes: Size[];
  brands: Brand[];
  homeSections: FilterHomeSection[];
  selectedCategories: number[];
  setSelectedCategories: (ids: number[]) => void;
  selectedColors: number[];
  setSelectedColors: (ids: number[]) => void;
  selectedSizes: number[];
  setSelectedSizes: (ids: number[]) => void;
  selectedBrands: number[];
  setSelectedBrands: (ids: number[]) => void;
  selectedHomeSections: number[];
  setSelectedHomeSections: (ids: number[]) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  priceLimits: [number, number];
  resetFilters: () => void;
  toggleSelection: (
    id: number,
    selectedItems: number[],
    setSelectedItems: (items: number[]) => void
  ) => void;
}

const FiltersContent = ({
  categories,
  colors,
  sizes,
  brands,
  homeSections,
  selectedCategories,
  setSelectedCategories,
  selectedColors,
  setSelectedColors,
  selectedSizes,
  setSelectedSizes,
  selectedBrands,
  setSelectedBrands,
  selectedHomeSections,
  setSelectedHomeSections,
  priceRange,
  setPriceRange,
  searchQuery,
  setSearchQuery,
  priceLimits,
  resetFilters,
  toggleSelection
}: FiltersContentProps) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-bold">{t("Search")}</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("Search products...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            autoFocus={false}
          />
        </div>
      </div>


      <div>
        <Label className="text-sm font-bold">{t("Categories")}</Label>
        <div className="mt-3 space-y-2">
          {categories && categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                onCheckedChange={() =>
                  toggleSelection(category.id, selectedCategories, setSelectedCategories)
                }
                checked={selectedCategories.includes(category.id)}
              />
              <Label htmlFor={`category-${category.id}`} className="text-sm">
                {getText(category.name, i18n.language)}
              </Label>
            </div>
          ))}
        </div>
      </div>
      {
        (colors && colors.length > 0) && <>

          <div>
            <Label className="text-sm font-bold">{t("Colors")}</Label>
            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
              {colors.map((color) => (
                <div key={color.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color.id}`}
                    onCheckedChange={() =>
                      toggleSelection(color.id, selectedColors, setSelectedColors)
                    }
                    checked={selectedColors.includes(color.id)}
                  />
                  <Label htmlFor={`color-${color.id}`} className="text-sm">
                    {getText(color.name, i18n.language)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      }


      {
        (sizes && sizes.length > 0) && <>

          <div>
            <Label className="text-sm font-bold">{t("Sizes")}</Label>
            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
              {sizes.map((size) => (
                <div key={size.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size.id}`}
                    onCheckedChange={() =>
                      toggleSelection(size.id, selectedSizes, setSelectedSizes)
                    }
                    checked={selectedSizes.includes(size.id)}
                  />
                  <Label htmlFor={`size-${size.id}`} className="text-sm">
                    {getText(size.name, i18n.language)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>

      }


      {(brands && brands.length > 0) && <>

        <div>
          <Label className="text-sm font-bold">{t("Brands")}</Label>
          <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand.id}`}
                  onCheckedChange={() =>
                    toggleSelection(brand.id, selectedBrands, setSelectedBrands)
                  }
                  checked={selectedBrands.includes(brand.id)}
                />
                <Label htmlFor={`brand-${brand.id}`} className="text-sm">
                  {brand.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </>}

      {(homeSections && homeSections.length > 0) && <>

        <div>
          <Label className="text-sm font-bold">{t("Home Sections")}</Label>
          <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
            {homeSections.map((homeSection) => (
              <div key={homeSection.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`homeSection-${homeSection.id}`}
                  onCheckedChange={() =>
                    toggleSelection(homeSection.id, selectedHomeSections, setSelectedHomeSections)
                  }
                  checked={selectedHomeSections.includes(homeSection.id)}
                />
                <Label htmlFor={`homeSection-${homeSection.id}`} className="text-sm">
                  {getText(homeSection.title, i18n.language)}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </>}


      <div>
        <Label className="text-sm font-bold">{t("Price Range")}</Label>
        <div className="mt-3 flex space-x-2">
          <Input
            type="number"
            min={priceLimits[0]}
            max={priceRange[1]}
            value={priceRange[0]}
            onChange={(e) => {
              const val = Math.max(priceLimits[0], Math.min(Number(e.target.value), priceRange[1]));
              setPriceRange([val, priceRange[1]]);
            }}
            className="w-1/2"
            placeholder={t("Min")}
          />
          <Input
            type="number"
            min={priceRange[0]}
            max={priceLimits[1]}
            value={priceRange[1]}
            onChange={(e) => {
              const val = Math.min(priceLimits[1], Math.max(Number(e.target.value), priceRange[0]));
              setPriceRange([priceRange[0], val]);
            }}
            className="w-1/2"
            placeholder={t("Max")}
          />
        </div>
      </div>



      <Button variant="outline" onClick={resetFilters} className="w-full">
        <X className="w-4 h-4 mr-2" />
        {t("Clear All Filters")}
      </Button>
    </div>
  );
};

export default FiltersContent;