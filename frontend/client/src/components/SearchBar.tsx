import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { fetchShop } from '@/lib/services/shop-service';
import { Product } from '@/types/api.interfaces';
import { cn } from '@/lib/utils';
import { getText } from '@/utils/getText';

interface SearchBarProps {
  className?: string;
  onSearch?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ className, onSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const params = new URLSearchParams(location.search);
  const initialSearch = params.get('search') || '';

  const [searchText, setSearchText] = useState(initialSearch);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const newParams = new URLSearchParams(location.search);
    setSearchText(newParams.get('search') || '');
  }, [location.search]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchShop({
        search: query.trim(),
        per_page: 5,
      });

      if (response.result && response.products) {
        setSuggestions(response.products);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    setSelectedIndex(-1);

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for debounce
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSearch = (searchQuery?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedSearch = (searchQuery || searchText).trim();
    const newParams = new URLSearchParams(location.search);

    if (trimmedSearch) {
      newParams.set('search', trimmedSearch);
    } else {
      newParams.delete('search');
    }

    setShowSuggestions(false);
    navigate(`/shop?${newParams.toString()}`);
    onSearch?.();
  };

  const handleSuggestionClick = (product: Product) => {
    navigate(`/product/${product.slug}`);
    setShowSuggestions(false);
    setSearchText('');
    onSearch?.();
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const formatPrice = (price: number, discount: number) => {
    const finalPrice = price - (price * discount / 100);
    return finalPrice.toFixed(2);
  };

  return (
    <form onSubmit={(e) => handleSearch(undefined, e)} className={className}>
      <div ref={searchRef} className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
        <Input
          placeholder={t("Search products...")}
          value={searchText}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="pl-10 pr-12 h-12 border-2 focus:border-primary"
        />
        {(isLoading || searchText) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : searchText ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="hover:text-foreground text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border-2 border-border rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-50">
            {suggestions.map((product, index) => (
              <div
                key={product.id}
                onClick={() => handleSuggestionClick(product)}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-accent",
                  selectedIndex === index && "bg-accent"
                )}
              >
                <img
                  src={product.image}
                  alt={getText(product.name, currentLanguage)}
                  className="w-12 h-12 object-cover rounded flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-product.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {getText(product.name, currentLanguage)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {product.discount > 0 ? (
                      <>
                        <span className="text-sm font-semibold text-primary">
                          ${formatPrice(product.price, product.discount)}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          ${product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-primary">
                        ${product.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleSearch()}
              className="w-full p-3 text-sm text-center text-primary hover:bg-accent border-t border-border font-medium"
            >
              {t("View all results")}
            </button>
          </div>
        )}

        {/* No results message */}
        {showSuggestions && !isLoading && searchText && suggestions.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border-2 border-border rounded-lg shadow-lg p-4 z-50">
            <p className="text-sm text-muted-foreground text-center">
              {t("No products found")}
            </p>
          </div>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
