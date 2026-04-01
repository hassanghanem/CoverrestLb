import { Currency } from '@/types/api.interfaces';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CurrencyState {
    selectedCurrency: Currency;
}

const initialState: CurrencyState = {
    selectedCurrency: {
        id: 1,
        code: 'USD',
        symbol: '$',
        exchange_rate: 1.0,
        name: { en: 'US Dollar' },
        is_default: true,
    },
};

const currencySlice = createSlice({
    name: 'currency',
    initialState,
    reducers: {
        setSelectedCurrency(state, action: PayloadAction<Currency>) {
            state.selectedCurrency = action.payload;
        },
        clearSelectedCurrency(state) {
            state.selectedCurrency = initialState.selectedCurrency;
        },
    },
});

export const { setSelectedCurrency, clearSelectedCurrency } = currencySlice.actions;

export default currencySlice.reducer;
