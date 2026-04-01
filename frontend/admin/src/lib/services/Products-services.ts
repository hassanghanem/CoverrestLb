/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetProductResponse, GetProductsResponse, ImportResult, ValidationResult } from "@/types/response.interfaces";
import API_ENDPOINTS, { } from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";


export const getProducts = async (params: Record<string, any>): Promise<GetProductsResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.LIST, {
            params,
            paramsSerializer: {
                serialize: (params) => {
                    const searchParams = new URLSearchParams();
                    Object.entries(params).forEach(([key, value]) => {
                        if (value === undefined || value === null || value === "") return;
                        if (typeof value === 'object' && key === 'filters' && value !== null) {
                            Object.entries(value).forEach(([fKey, fValue]) => {
                                if (fValue !== undefined && fValue !== null && fValue !== "") {
                                    searchParams.append(`filters[${fKey}]`, String(fValue));
                                }
                            });
                        } else {
                            searchParams.append(key, String(value));
                        }
                    });
                    return searchParams.toString();
                }
            }
        });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch Products",
            products: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};


export const getProductById = async (id: number): Promise<GetProductResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.DETAILS(id));
        return response.data;
    } catch (error: any) {

        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch Products",
        };
    }
};


export const createProduct = async (productData: FormData) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.CREATE, productData, {

        });
        if (response.data.result) {
            toast.success(response.data.message);
        } else {
            showApiErrorToasts(response.data);
        }

        return response.data;
    } catch (error: any) {
        showApiErrorToasts(error?.response?.data || {});
        return {
            result: false,
            message: error?.response?.data?.message,
        };
    }
};

export const updateProduct = async (productId: number, productData: FormData) => {

    try {
        productData.append('_method', 'PUT');
        const response = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.UPDATE(productId), productData, {

        });
        if (response.data.result) {
            toast.success(response.data.message);
        } else {
            showApiErrorToasts(response.data);
        }

        return response.data;
    } catch (error: any) {
        showApiErrorToasts(error?.response?.data || {});
        return {
            result: false,
            message: error?.response?.data?.message,
        };
    }
};


export const deleteProduct = async (productId: number) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.PRODUCTS.DELETE(productId));
        if (response.data.result) {
            toast.success(response.data.message);
        } else {
            showApiErrorToasts(response.data);
        }

        return response.data;
    } catch (error: any) {
        showApiErrorToasts(error?.response?.data || {});
        return {
            result: false,
            message: error?.response?.data?.message,
        };
    }
};

export const bulkUpdateProducts = async (productIds: number[], updateData: any) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.PRODUCTS.BULK_UPDATE, {
            product_ids: productIds,
            update_data: updateData,
        });

        return response.data;
    } catch (error: any) {
        showApiErrorToasts(error?.response?.data || {});
        throw error;
    }
};

export const updateProductImage = async (imageId: number, data: FormData) => {
    try {
        data.append('_method', 'PUT');
        const response = await axiosInstance.post(API_ENDPOINTS.PRODUCT_IMAGES.UPDATE(imageId), data);
        if (response.data.result) {
            toast.success(response.data.message);
        } else {
            showApiErrorToasts(response.data);
        }

        return response.data;
    } catch (error: any) {
        showApiErrorToasts(error?.response?.data || {});
        return {
            result: false,
            message: error?.response?.data?.message,
        };
    }
};

export const deleteProductImage = async (imageId: number) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.PRODUCT_IMAGES.DELETE(imageId));
        if (response.data.result) {
            toast.success(response.data.message);
        } else {
            showApiErrorToasts(response.data);
        }

        return response.data;
    } catch (error: any) {
        showApiErrorToasts(error?.response?.data || {});
        return {
            result: false,
            message: error?.response?.data?.message,
        };
    }
};

export const updateVariantImage = async (imageId: number, data: FormData) => {
    try {
        data.append('_method', 'PUT');
        const response = await axiosInstance.post(API_ENDPOINTS.VARIANT_IMAGES.UPDATE(imageId), data);
        if (response.data.result) {
            toast.success(response.data.message);
        } else {
            showApiErrorToasts(response.data);
        }

        return response.data;
    } catch (error: any) {
        showApiErrorToasts(error?.response?.data || {});
        return {
            result: false,
            message: error?.response?.data?.message,
        };
    }
};

export const deleteVariantImage = async (imageId: number) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.VARIANT_IMAGES.DELETE(imageId));
        if (response.data.result) {
            toast.success(response.data.message);
        } else {
            showApiErrorToasts(response.data);
        }

        return response.data;
    } catch (error: any) {
        showApiErrorToasts(error?.response?.data || {});
        return {
            result: false,
            message: error?.response?.data?.message,
        };
    }
};

export const deleteProductVariant = async (variantId: number) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.PRODUCT_VARIANT.DELETE(variantId));
        if (response.data.result) {
            toast.success(response.data.message);
        } else {
            showApiErrorToasts(response.data);
        }

        return response.data;
    } catch (error: any) {
        showApiErrorToasts(error?.response?.data || {});
        return {
            result: false,
            message: error?.response?.data?.message,
        };
    }
};

export const generateBarcode = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.GENERATE_BARCODE);
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch Products",
        };
    }
};

export const openProductBarcodesPrint = async (
    productId: number,
    options?: { variantIds?: number[] }
): Promise<void> => {
    const params = new URLSearchParams();
    options?.variantIds?.forEach((id) => {
        if (id != null) params.append("variant_ids[]", String(id));
    });

    const path = API_ENDPOINTS.PRODUCTS.PRINT_BARCODES(productId);
    const urlWithQuery = params.toString() ? `${path}?${params.toString()}` : path;

    try {
        const response = await axiosInstance.get<string>(urlWithQuery, {
            responseType: "text",
        });

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Popup blocked. Please allow popups to print barcodes.');
            return;
        }
        printWindow.document.write(response.data as unknown as string);
        printWindow.document.close();
    } catch (error: any) {
        const serverMessage = error?.response?.data?.message;
        toast.error(serverMessage || 'Failed to open barcode print view.');
    }
};

export const openBulkBarcodesPrint = async (options: {
    productIds?: number[];
    variantIds?: number[];
}): Promise<void> => {
    const hasProducts = options.productIds && options.productIds.length > 0;
    const hasVariants = options.variantIds && options.variantIds.length > 0;
    if (!hasProducts && !hasVariants) return;
    const params = new URLSearchParams();
    options.productIds?.forEach((id) => {
        if (id != null) params.append("product_ids[]", String(id));
    });
    options.variantIds?.forEach((id) => {
        if (id != null) params.append("variant_ids[]", String(id));
    });

    const path = API_ENDPOINTS.BARCODES.PRINT;
    const urlWithQuery = params.toString() ? `${path}?${params.toString()}` : path;

    try {
        const response = await axiosInstance.get<string>(urlWithQuery, {
            responseType: 'text',
        });

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Popup blocked. Please allow popups to print barcodes.');
            return;
        }
        printWindow.document.write(response.data as unknown as string);
        printWindow.document.close();
    } catch (error: any) {
        const serverMessage = error?.response?.data?.message;
        toast.error(serverMessage || 'Failed to open barcode print view.');
    }
};
export const validateProductImport = async (formData: FormData): Promise<ValidationResult> => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.IMPORT_VALIDATE, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data;
    } catch (error: any) {
        const errorData = error?.response?.data;
        showApiErrorToasts(errorData || {});
        return {
            result: false,
            message: errorData?.message || "Failed to validate data",
            data: {
                excel_validation: {
                    total_rows: 0,
                    valid_rows: 0,
                    invalid_rows: 0,
                    errors: errorData?.data?.errors || [],
                    warnings: errorData?.data?.warnings || []
                },
                zip_validation: {
                    total_barcodes_found: 0,
                    barcodes_with_images: [],
                    total_images_found: 0,
                    zip_structure_errors: []
                },
                compatibility_analysis: {
                    excel_barcodes_count: 0,
                    zip_barcodes_count: 0,
                    matching_barcodes: [],
                    missing_in_zip: [],
                    extra_in_zip: [],
                    coverage_percentage: 0
                },
                overall_status: 'error'
            }
        };
    }
};

export const importProducts = async (formData: FormData): Promise<ImportResult> => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.IMPORT, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data;
    } catch (error: any) {
        const errorData = error?.response?.data;
        showApiErrorToasts(errorData || {});
        return {
            result: false,
            message: errorData?.message || "Failed to import products",
            data: {
                successful: 0,
                failed: 0,
                total_processed: 0,
                errors: errorData?.data?.errors || []
            }
        };
    }
};

export const downloadProductTemplate = async (): Promise<void> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.EXPORT_TEMPLATE, {
            responseType: "blob",
        });

        // Check if the response is successful
        if (response.status !== 200) {
            throw new Error('Failed to download template');
        }

        const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "products_import_template.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error: any) {
        toast.error("Failed to download template");
        throw error;
    }
};

export const exportSelectedProducts = async (productIds: number[]): Promise<void> => {
    if (!productIds?.length) return;

    toast.success("Export started…");

    try {
        const response = await axiosInstance.post(
            API_ENDPOINTS.PRODUCTS.EXPORT_SELECTED,
            { product_ids: productIds },
            { responseType: "blob" }
        );

        const disposition = response.headers?.["content-disposition"] as string | undefined;
        const filenameMatch = disposition?.match(/filename\*=UTF-8''(.+)$|filename="?([^";]+)"?/i);

        // Use server filename or generate timestamped fallback
        let filename = decodeURIComponent(filenameMatch?.[1] || filenameMatch?.[2] || "");
        if (!filename) {
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
            filename = `products_export_${dateStr}_${timeStr}.zip`;
        }

        const blob = new Blob([response.data], { type: "application/zip" });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(url);

        toast.success(`Export ready. Downloaded ${filename}.`);
    } catch (error: any) {
        const status = error?.response?.status;
        if (status === 422 && error?.response?.data) {
            showApiErrorToasts(error.response.data);
        }

        const serverMessage = error?.response?.data?.message;
        toast.error(serverMessage || "Export failed. Please try again.");
        throw error;
    }
};