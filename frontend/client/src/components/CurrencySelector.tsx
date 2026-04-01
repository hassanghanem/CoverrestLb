import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useSettings } from '@/hooks/usePublicData';
import { useSelector, useDispatch } from 'react-redux';
import { Currency } from '@/types/api.interfaces';
import { RootState } from '@/lib/store/store';
import { setSelectedCurrency } from '@/lib/store/slices/currencySlice';

const CurrencySelector = () => {
  const dispatch = useDispatch();

  const { data: settingsData } = useSettings();
  const currencies: Currency[] = settingsData?.currencies || [];

  const selectedCurrency = useSelector(
    (state: RootState) => state.currency.selectedCurrency
  );

  const currentCode = selectedCurrency?.code || 'USD';

  const handleSelectCurrency = (currency: Currency) => {
    dispatch(setSelectedCurrency(currency));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          {currentCode}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.id}
            onClick={() => handleSelectCurrency(currency)}
            className={`flex items-center justify-between ${currency.code === currentCode ? 'font-semibold' : ''
              }`}
          >
            <span>{currency.code}</span>
            {currency.symbol && (
              <span className="text-muted-foreground text-xs">
                {currency.symbol}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;
