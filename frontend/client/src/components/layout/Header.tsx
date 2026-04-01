import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Heart, Menu, X, Phone, Search, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { navItems } from '@/constants/data';
import SearchBar from '../SearchBar';
import LanguageSelector from '../LanguageSelector';
import CurrencySelector from '../CurrencySelector';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useGetCart, useGetWishlist, useSettings } from '@/hooks/usePublicData';
import { getEffectiveTheme, useTheme } from '@/context/theme-context';

const Header = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { data: wishlistData } = useGetWishlist(isAuthenticated, {});
  const WishlistTotalItems = wishlistData?.pagination?.total ?? 0;
  const { data: cartData } = useGetCart(isAuthenticated);
  const CartTotalItems = cartData?.cart?.total_items ?? 0;
  const { data: settingsData } = useSettings();
  const configurations = settingsData?.configurations || [];

  const contact_phone = configurations.find(item => item.key === 'contact_phone')?.value;
  const store_name = configurations.find(item => item.key === 'store_name')?.value;

  const theme = getEffectiveTheme(useTheme().theme);
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-colors duration-300">
      <div className="bg-primary text-primary-foreground py-2">

        <div className="mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between text-sm">
          {contact_phone && (
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 shrink-0" />
              <a
                href={contact_phone ? `https://wa.me/${contact_phone.replace(/\D/g, '')}` : 'https://wa.me/1234567890'}
                target="_blank"
                rel="noopener noreferrer"

              >+{contact_phone}</a>
            </div>
          )}

          {/* Right side: toggles */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSelector />
            <CurrencySelector />
          </div>
        </div>
      </div>

      <div className="container mx-auto container-padding py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            {
              (theme === 'light') ?
                <img src="/assets/logo-white-nobg.png" alt={store_name || 'Store Logo'} className="h-auto w-[200px] sm:w-[200px] md:w-[250px]" />
                :
                <img src="/assets/logo-black-nobg.png" alt={store_name || 'Store Logo'} className="h-auto w-[200px] sm:w-[200px] md:w-[250px]" />
            }
          </Link>

          <SearchBar className="hidden lg:flex flex-1 max-w-xl mx-8" onSearch={() => setIsMenuOpen(false)} />

          <div className="flex items-center space-x-2">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSearchOpen(prev => !prev)}
            >
              {isSearchOpen ? <SearchX className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </Button>
            {isAuthenticated ? (
              <>


                <Button variant="ghost" size="icon" className="relative" asChild>
                  <Link to="/wishlist">
                    <Heart className="w-5 h-5" />
                    {WishlistTotalItems > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {WishlistTotalItems}
                      </Badge>
                    )}
                  </Link>
                </Button>

                <Button variant="ghost" size="icon" className="relative" asChild>
                  <Link to="/cart">
                    <ShoppingCart className="w-5 h-5" />
                    {CartTotalItems > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {CartTotalItems}
                      </Badge>
                    )}
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="relative" asChild>
                  <Link to="/profile">
                    <User className="w-5 h-5" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => localStorage.setItem('loginRedirect', location.pathname)} className="text-foreground hover:text-primary font-medium">
                  {t("Login")}
                </Link>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

        </div>

        <nav className="hidden lg:flex items-center justify-center mt-6 space-x-8">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.url}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t(item.title)}
            </Link>
          ))}
        </nav>

        {isMenuOpen && (
          <nav className="lg:hidden mt-2 border-t border-border pt-2 animate-fade-in">
            <div className="space-y-4">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.url}
                  className="block text-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(item.title)}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Mobile Search Expandable Bar */}
        {isSearchOpen && (
          <div className="lg:hidden mt-4 pb-2 animate-fade-in">
            <SearchBar
              className="w-full"
              onSearch={() => setIsSearchOpen(false)}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
