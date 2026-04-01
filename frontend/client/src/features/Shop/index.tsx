import { useTranslation } from 'react-i18next';
import { Grid, List, Share2, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ProductCard } from '@/components/ui/product-card';
import StaticFullPageSpinner from '@/components/StaticFullPageSpinner';
import GeneralError from '../Errors/GeneralError';
import { useShopFilters } from './hooks/useShopFilters';
import FiltersContent from './components/FiltersContent';
import SearchBar from './components/SearchBar';
import SortSelect from './components/SortSelect';
import { useState, useEffect, useRef } from 'react';
import { Spinner } from '@/components/ui/spinner';

const Shop = () => {
  const { t, i18n } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    categories,
    colors,
    sizes,
    brands,
    homeSections,
    sorts,
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
    priceLimits,
    selectedSortBy,
    setSelectedSortBy,
    resetFilters,
    toggleSelection,
    isSettingsLoading,
    isSettingsError,
    isShopLoading,
    isShopError,
    searchQuery,
    setSearchQuery,
    shopQuery,
    copySearchUrl,
  } = useShopFilters();

  const allProducts = shopQuery?.data?.pages?.flatMap(page => page.products) ?? [];
  const hasNextPage = shopQuery?.hasNextPage ?? false;
  const isFetchingNextPage = shopQuery?.isFetchingNextPage ?? false;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !isShopLoading) {
          shopQuery?.fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, isShopLoading, shopQuery]);

  if (isSettingsLoading) return <StaticFullPageSpinner />;
  if (isShopError || isSettingsError) return <GeneralError />;

  return (
    <div className="container mx-auto container-padding py-6 lg:py-8">

      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">{t("All Products")}</h1>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">

        <div className="hidden lg:block">
          <div className="sticky top-24">
            <Card>
              <CardContent className="p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">{t("Filters")}</h3>
                </div>
                <FiltersContent
                  categories={categories}
                  colors={colors}
                  sizes={sizes}
                  brands={brands}
                  homeSections={homeSections}
                  selectedCategories={selectedCategories}
                  selectedColors={selectedColors}
                  selectedSizes={selectedSizes}
                  selectedBrands={selectedBrands}
                  selectedHomeSections={selectedHomeSections}
                  toggleSelection={toggleSelection}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  setSelectedBrands={setSelectedBrands}
                  setSelectedCategories={setSelectedCategories}
                  setSelectedColors={setSelectedColors}
                  setSelectedSizes={setSelectedSizes}
                  setSelectedHomeSections={setSelectedHomeSections}
                  priceLimits={priceLimits}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  resetFilters={resetFilters}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div
            className="
      flex flex-wrap items-center gap-3 sm:gap-4 mb-6
      w-full
    "
          >
            <div className="relative flex-1 min-w-[200px] lg:hidden">
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="lg:hidden flex items-center gap-2 shrink-0"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {t("Filters")}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-80 overflow-y-auto"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <SheetHeader>
                  <SheetTitle>{t("Filters")}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FiltersContent
                    categories={categories}
                    colors={colors}
                    sizes={sizes}
                    brands={brands}
                    homeSections={homeSections}
                    selectedCategories={selectedCategories}
                    selectedColors={selectedColors}
                    selectedSizes={selectedSizes}
                    selectedBrands={selectedBrands}
                    selectedHomeSections={selectedHomeSections}
                    toggleSelection={toggleSelection}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    setSelectedBrands={setSelectedBrands}
                    setSelectedCategories={setSelectedCategories}
                    setSelectedColors={setSelectedColors}
                    setSelectedSizes={setSelectedSizes}
                    setSelectedHomeSections={setSelectedHomeSections}
                    priceLimits={priceLimits}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    resetFilters={resetFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <div
              className="
        flex flex-wrap items-center gap-2 sm:gap-3
        ml-auto
        w-full sm:w-auto justify-end
      "
            >
              <SortSelect
                sorts={sorts}
                selectedSortBy={selectedSortBy}
                setSelectedSortBy={setSelectedSortBy}
                i18n={i18n}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="whitespace-nowrap"
              >
                {t("Clear")}
              </Button>

              <Button
                variant="outline"
                onClick={copySearchUrl}
                className="gap-2 whitespace-nowrap"
              >
                <Share2 className="w-4 h-4" />
                {t("Share")}
              </Button>

              <div className="flex border rounded-lg shrink-0">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {isShopLoading && allProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Spinner size="lg" />
              <p className="text-muted-foreground">{t("Loading products...")}</p>
            </div>
          ) : (
            <>
              {allProducts.length > 0 ? (
                <>
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                        : "flex flex-col gap-4"
                    }
                  >
                    {allProducts.map((product) => (
                      <ProductCard key={product.id} product={product} viewMode={viewMode} />
                    ))}
                  </div>

                  <div ref={loadMoreRef} className="flex justify-center items-center pt-2">
                    {isFetchingNextPage && (
                      <div className="flex flex-col items-center space-y-2">
                        <Spinner size="md" />
                        <p className="text-sm text-muted-foreground">{t("Loading more products...")}</p>
                      </div>
                    )}

                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    {t("No products found matching your criteria.")}
                  </div>
                  <Button onClick={resetFilters}>{t("Clear All Filters")}</Button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Shop;
