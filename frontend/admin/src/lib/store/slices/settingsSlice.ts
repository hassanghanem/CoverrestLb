import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  Permission,
  Role,
  Team,
  Category,
  Brand,
  Color,
  Configuration,
  Tag,
  Warehouse,
  OrderStatus,
  ReturnOrderStatus,
  PaymentMethodOption,
} from '@/types/api.interfaces';
import { getAllSettings } from '@/lib/services/Settings-services';

export interface SettingsState {
  roles: Role[];
  permissions: Permission[];
  teams: Team[];

  categories: Category[];
  brands: Brand[];
  colors: Color[];
  configurations: Configuration[];
  tags: Tag[];
  warehouses: Warehouse[];

  order_statuses: OrderStatus[];
  payment_statuses: string[];
  payment_methods: PaymentMethodOption[];
  return_order_statuses: ReturnOrderStatus[];

  order_status_transitions: Record<number, number[]>;
  payment_status_transitions: Record<number, number[]>;
  return_order_status_transitions: Record<number, number[]>;
  order_sources: string[]

  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  roles: [],
  permissions: [],
  teams: [],

  categories: [],
  brands: [],
  colors: [],
  configurations: [],
  tags: [],
  warehouses: [],

  order_statuses: [],
  payment_statuses: [],
  payment_methods: [],
  return_order_statuses: [],

  order_status_transitions: {},
  payment_status_transitions: {},
  return_order_status_transitions: {},
  order_sources: [],

  loading: false,
  error: null,
};

// Async thunk to fetch settings
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllSettings();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to load settings'
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { settings: SettingsState };
      const {
        roles,
        permissions,
        categories,
        brands,
        colors,
        configurations,
        tags,
        warehouses,
      } = state.settings;

      const shouldFetch =
        roles.length === 0 ||
        permissions.length === 0 ||
        categories.length === 0 ||
        brands.length === 0 ||
        colors.length === 0 ||
        configurations.length === 0 ||
        tags.length === 0 ||
        warehouses.length === 0;

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

        state.roles = action.payload.roles;
        state.permissions = action.payload.permissions;
        state.teams = action.payload.teams;

        state.categories = action.payload.categories;
        state.brands = action.payload.brands;
        state.colors = action.payload.colors;
        state.configurations = action.payload.configurations;
        state.tags = action.payload.tags;
        state.warehouses = action.payload.warehouses;

        state.order_statuses = action.payload.order_statuses;
        state.payment_statuses = action.payload.payment_statuses;
        state.payment_methods = action.payload.payment_methods;
        state.return_order_statuses = action.payload.return_order_statuses;

        state.order_status_transitions = action.payload.order_status_transitions;
        state.payment_status_transitions =
          action.payload.payment_status_transitions;
        state.return_order_status_transitions =
          action.payload.return_order_status_transitions;
        state.order_sources =
          action.payload.order_sources;

      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default settingsSlice.reducer;
