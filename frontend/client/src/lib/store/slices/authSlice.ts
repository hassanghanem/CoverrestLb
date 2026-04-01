import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Client } from "@/types/api.interfaces";
import { deleteAccount, signOutRequest } from "@/lib/services/profile-service";
import { clearAllStorage } from "@/utils/clearAllStorage";


interface AuthState {
    email: string;
    expiryAt: string;
    client: Client | null;
    isAuthenticated: boolean;
    isRegister: boolean;

    formData: Record<string, any>;
}

const initialState: AuthState = {
    email: "",
    expiryAt: "",
    client: null,
    isAuthenticated: false,
    isRegister: false,
    formData: {},
};

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const response = await signOutRequest();
            if (!response.result) {
                throw new Error(response.message);
            }
            await clearAllStorage();
            return response;
        } catch (error: any) {
            await clearAllStorage();
            return rejectWithValue(error.message);
        }
    }
);


export const deleteacc = createAsyncThunk(
    'auth/deleteaccount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await deleteAccount();
            if (!response.result) {
                throw new Error(response.message);
            }
            await clearAllStorage();
            return response;
        } catch (error: any) {
            await clearAllStorage();
            return rejectWithValue(error.message);
        }
    }
);


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthData: (state, { payload }: PayloadAction<Pick<AuthState, "email" | "expiryAt">>) => {
            Object.assign(state, payload);
        },
        setClientData: (state, { payload }: PayloadAction<Client>) => {
            state.client = payload;
            state.isAuthenticated = true;
        },
        setFormData: (state, { payload }: PayloadAction<Record<string, any>>) => {
            state.formData = { ...state.formData, ...payload };
            state.isRegister = true;
        },
        resetFormData: (state) => {
            state.formData = {};
            state.isRegister = false;

        },
        setIsRegister: (state, { payload }: PayloadAction<boolean>) => {
            state.isRegister = payload;
        },
        resetAuthState: () => initialState,

    },
    extraReducers: (builder) => {
        builder
            .addCase(logout.fulfilled, () => {
                return initialState;
            })
            .addCase(logout.rejected, () => {
                return initialState;
            });
    }
});

export const { setAuthData, setClientData, setFormData, resetFormData, setIsRegister, resetAuthState } = authSlice.actions;


export default authSlice.reducer;

