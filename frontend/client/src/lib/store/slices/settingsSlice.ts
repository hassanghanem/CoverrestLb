import { getAllSettings } from '@/lib/services/settings-service';
import {
  Category,
  Brand,
  Currency,
  Color,
  Configuration,
  Tag,
} from '@/types/api.interfaces';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface SettingsState {
  categories: Category[];
  brands: Brand[];
  currencies: Currency[];
  colors: Color[];
  configurations: Configuration[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {

  categories: [],
  brands: [],
  currencies: [],
  colors: [],
  configurations: [],
  tags: [],
  loading: false,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllSettings();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { settings: SettingsState };
      const {
        categories,
        brands,
        currencies,
        colors,
        configurations,
        tags,
      } = state.settings;

      const shouldFetch =
        categories.length === 0 ||
        brands.length === 0 ||
        currencies.length === 0 ||
        colors.length === 0 ||
        configurations.length === 0 ||
        tags.length === 0

      return shouldFetch;
    },
  }
);


export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.brands = action.payload.brands;
        state.currencies = action.payload.currencies;
        state.colors = action.payload.colors;
        state.configurations = action.payload.configurations;
        state.tags = action.payload.tags;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default settingsSlice.reducer;
