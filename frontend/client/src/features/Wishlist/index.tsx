import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Grid, List, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StaticFullPageSpinner from '@/components/StaticFullPageSpinner';
import { useGetWishlist } from '@/hooks/usePublicData';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { ProductCard } from '@/components/ui/product-card';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';

const Wishlist = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const { data: wishlistData, isLoading, isFetching } = useGetWishlist(isAuthenticated, { page: currentPage, per_page: 2 });

    const hasNextPage = wishlistData?.pagination?.current_page ? 
        wishlistData.pagination.current_page < wishlistData.pagination.last_page : false;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetching) {
                    setCurrentPage(prev => prev + 1);
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef && !isLoading) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [hasNextPage, isFetching, isLoading]);

    if (isLoading && currentPage === 1) return <StaticFullPageSpinner />;

    if (wishlistData?.wishlist.length === 0 && currentPage === 1) {
        return (
            <div className="container mx-auto container-padding py-16">
                <div className="text-center max-w-md mx-auto space-y-8">
                    <div className="w-32 h-32 bg-muted rounded-full mx-auto flex items-center justify-center">
                        <Heart className="w-16 h-16 text-muted-foreground" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold">{t("Your wishlist is empty")}</h1>
                        <p className="text-muted-foreground text-lg">
                            {t("Save items you love for later by clicking the heart icon when browsing.")}
                        </p>
                    </div>
                    <div className="space-y-4">
                        <Button size="lg" className="w-full h-14" asChild>
                            <Link to="/shop">
                                <ShoppingBag className="w-5 h-5 mr-2" />
                                {t("Start Shopping")}
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="w-full h-14" asChild>
                            <Link to="/">{t("Browse Categories")}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto container-padding py-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{t("My Wishlist")}</h1>
                    <p className="text-muted-foreground mt-2">
                        {t('Showing', { shown: wishlistData?.wishlist?.length ?? 0, total: wishlistData?.pagination?.total ?? 0 })}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex border rounded-lg">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="rounded-r-none"
                        >
                            <Grid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="rounded-l-none"
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div
                className={
                    viewMode === 'grid'
                        ? 'grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                        : 'flex flex-col gap-4'
                }
            >
                {wishlistData?.wishlist.map((wishlist) => (
                    <ProductCard
                        key={wishlist.id}
                        product={wishlist.product}
                        viewMode={viewMode}
                    />
                ))}
            </div>

            <div ref={loadMoreRef} className="flex justify-center items-center pt-8">
                {isFetching && hasNextPage && (
                    <div className="flex flex-col items-center space-y-2">
                        <Spinner size="md" />
                        <p className="text-sm text-muted-foreground">{t("Loading more items...")}</p>
                    </div>
                )}
            </div>

            <div className="text-center mt-12">
                <Button variant="outline" size="lg" className="h-14 px-8" asChild>
                    <Link to="/shop">{t("Continue Shopping")}</Link>
                </Button>
            </div>
        </div>
    );
};

export default Wishlist;
