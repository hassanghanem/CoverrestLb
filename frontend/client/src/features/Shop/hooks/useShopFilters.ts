import { useSettings } from '@/hooks/usePublicData';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShop } from './useShop';

type Range = [number, number];

export const useShopFilters = () => {
    const [searchParams] = useSearchParams();

    const parseNumberArray = (param: string | null): number[] =>
        param
            ? param
                .split(',')
                .map((v) => Number(v.trim()))
                .filter((n) => !isNaN(n) && n > 0)
            : [];

    const parseRange = (param: string | null, defaultRange: Range): Range => {
        if (!param) return defaultRange;
        const parts = param.split(',').map((v) => Number(v.trim()));
        if (parts.length === 2 && parts.every((n) => !isNaN(n) && n >= 0)) {
            return parts[0] <= parts[1] ? [parts[0], parts[1]] : [parts[1], parts[0]];
        }
        return defaultRange;
    };

    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedColors, setSelectedColors] = useState<number[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
    const [selectedHomeSections, setSelectedHomeSections] = useState<number[]>([]);
    const [selectedSortBy, setSelectedSortBy] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [priceRange, setPriceRange] = useState<Range>([0, 10000]);
    const [isFiltersInitialized, setIsFiltersInitialized] = useState(false);

    const initialPriceRangeSet = useRef(false);

    const {
        data: settingsData,
        isLoading: isSettingsLoading,
        isError: isSettingsError,
    } = useSettings();

    const categories = settingsData?.categories || [];
    const colors = useMemo(() => {
        const rawColors = settingsData?.colors || [];
        return [...rawColors].sort((a, b) => a.id - b.id);
    }, [settingsData?.colors]);

    const sizes = useMemo(() => {
        const rawSizes = settingsData?.sizes || [];
        return [...rawSizes].sort((a, b) => a.id - b.id);
    }, [settingsData?.sizes]);

    const brands = settingsData?.brands || [];
    const homeSections = settingsData?.homeSections || [];
    const sorts = settingsData?.sorts || [];
    const priceLimits: Range = [
        settingsData?.price_range?.min ?? 0,
        settingsData?.price_range?.max ?? 10000,
    ];

    useEffect(() => {
        // Wait until settings (including price range and sorts) are loaded
        if (!settingsData) return;

        const newCategories = parseNumberArray(searchParams.get('categories'));
        setSelectedCategories(newCategories);

        const newColors = parseNumberArray(searchParams.get('colors'));
        setSelectedColors(newColors);

        const newSizes = parseNumberArray(searchParams.get('sizes'));
        setSelectedSizes(newSizes);

        const newBrands = parseNumberArray(searchParams.get('brands'));
        setSelectedBrands(newBrands);

        const newHomeSections = parseNumberArray(searchParams.get('homeSections'));
        setSelectedHomeSections(newHomeSections);

        const urlPriceRange = parseRange(searchParams.get('priceRange'), priceLimits);
        setPriceRange([
            Math.max(priceLimits[0], urlPriceRange[0]),
            Math.min(priceLimits[1], urlPriceRange[1]),
        ]);

        const urlSortBy = searchParams.get('sortBy');
        if (urlSortBy) {
            setSelectedSortBy(urlSortBy);
        } else if (!selectedSortBy && sorts.length > 0) {
            setSelectedSortBy(sorts[0].key || '');
        }

        const newSearchQuery = searchParams.get('search') || '';
        setSearchQuery(newSearchQuery);

        setIsFiltersInitialized(true);
    }, [
        searchParams.get('categories'),
        searchParams.get('colors'),
        searchParams.get('sizes'),
        searchParams.get('brands'),
        searchParams.get('homeSections'),
        searchParams.get('priceRange'),
        searchParams.get('sortBy'),
        searchParams.get('search'),
        priceLimits[0],
        priceLimits[1],
        settingsData,
        selectedSortBy,
        sorts,
    ]);

    const filters = useMemo(
        () => ({
            search: searchQuery || undefined,
            categories: selectedCategories.length > 0 ? selectedCategories : undefined,
            colors: selectedColors.length > 0 ? selectedColors : undefined,
            sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
            brands: selectedBrands.length > 0 ? selectedBrands : undefined,
            homeSections: selectedHomeSections.length > 0 ? selectedHomeSections : undefined,
            priceRange,
            sort: selectedSortBy || undefined,
            per_page: 10,
        }),
        [
            searchQuery,
            selectedCategories,
            selectedColors,
            selectedSizes,
            selectedBrands,
            selectedHomeSections,
            priceRange,
            selectedSortBy,
        ]
    );
    const isShopEnabled = isFiltersInitialized;

    const shopQuery = useShop(filters, isShopEnabled);

    const toggleSelection = useCallback(
        (id: number, selectedItems: number[], setSelectedItems: (items: number[]) => void) => {
            if (selectedItems.includes(id)) {
                setSelectedItems(selectedItems.filter((item) => item !== id));
            } else {
                setSelectedItems([...selectedItems, id]);
            }
        },
        []
    );

    const resetFilters = () => {
        setSelectedCategories([]);
        setSelectedColors([]);
        setSelectedSizes([]);
        setSelectedBrands([]);
        setSelectedHomeSections([]);
        setPriceRange(priceLimits);
        setSelectedSortBy(sorts[0]?.key || '');
        setSearchQuery('');
        initialPriceRangeSet.current = false;
    };

    const copySearchUrl = async () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (selectedCategories.length) params.set('categories', selectedCategories.join(','));
        if (selectedColors.length) params.set('colors', selectedColors.join(','));
        if (selectedSizes.length) params.set('sizes', selectedSizes.join(','));
        if (selectedBrands.length) params.set('brands', selectedBrands.join(','));
        if (selectedHomeSections.length) params.set('homeSections', selectedHomeSections.join(','));
        if (priceRange) params.set('priceRange', priceRange.join(','));
        if (selectedSortBy) params.set('sortBy', selectedSortBy);

        const url = `${window.location.pathname}?${params.toString()}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    url: window.location.origin + url,
                });
            } catch (err) {
                console.error('Sharing failed', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.origin + url);
            } catch (err) {
                console.error('Copy failed', err);
            }
        }
    };

    return {
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
        searchQuery,
        setSearchQuery,

        resetFilters,
        toggleSelection,

        isSettingsLoading,
        isSettingsError,
        isShopLoading: shopQuery.isLoading,
        isShopError: shopQuery.isError,

        shopQuery,
        copySearchUrl,
    };
};
