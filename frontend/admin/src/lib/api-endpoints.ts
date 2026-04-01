const BASE_URL = import.meta.env.VITE_BASE_URL;
const VERSION = import.meta.env.VITE_API_VERSION;

// Helper to prefix version to API paths
const withVersion = (path: string) => `/api/${VERSION}/admin/${path}`;

// Define all API endpoints
const API_ENDPOINTS = {
    BASE_URL: BASE_URL,
    CAPTCHA: {
        GENERATE: `/api/${VERSION}/captcha-token`,
    },
    AUTH: {
        CSRF: withVersion("app-launch"),
        LOGIN: withVersion("login"),
        VERIFY_OTP: withVersion("verify-otp"),
        FORGOT_PASSWORD: withVersion("forgot-password"),
        RESET_PASSWORD: withVersion("reset-password"),
        LOGOUT: withVersion("logout"),
    },
    BARCODES: {
        PRINT: withVersion("barcodes/print"),
    },
    DASHBOARD: {
        GET: withVersion("dashboard"),
    },
    PROFILE: {
        GET_CURRENT_USER: withVersion("getCurrentUser"),
        CHANGE_PASSWORD: withVersion("changePassword"),
    },
    SESSIONS: {
        LIST: withVersion("sessions"),
        LOGOUT_OTHERS: withVersion("logoutOtherDevices"),
        DESTROY: withVersion("logoutSpecificDevice"),
    },
    ACTIVITY_LOGS: {
        LIST: withVersion("activity-logs"),
    },
    SETTINGS: {
        LIST: withVersion("allSettings"),
        ALL_CLIENTS: withVersion("getAllClients"),
        ALL_CLIENT_ADDRESSES: withVersion("getClientAddresses"),
        GET_NOTIFICATIONS: withVersion("getNotifications"),
        ALL_ORDERES_CAN_BE_RETURNED: withVersion("getOrdersCanBeReturned"),
        ALL_PRODUCTS: withVersion("getAllProducts"),
    },
    USERS: {
        LIST: withVersion("users"),
        DETAILS: (id: number) => withVersion(`users/${id}`),
        CREATE: withVersion("users"),
        UPDATE: (id: number) => withVersion(`users/${id}`),
        DELETE: (id: number) => withVersion(`users/${id}`),
    },
    CATEGORIES: {
        LIST: withVersion("categories"),
        DETAILS: (id: number) => withVersion(`categories/${id}`),
        CREATE: withVersion("categories"),
        UPDATE: (id: number) => withVersion(`categories/${id}`),
        DELETE: (id: number) => withVersion(`categories/${id}`),
    },
    BRANDS: {
        LIST: withVersion("brands"),
        DETAILS: (id: number) => withVersion(`brands/${id}`),
        CREATE: withVersion("brands"),
        UPDATE: (id: number) => withVersion(`brands/${id}`),
        DELETE: (id: number) => withVersion(`brands/${id}`),
    },
    COLOR_SEASONS: {
        LIST: withVersion("color-seasons"),
        DETAILS: (id: number) => withVersion(`color-seasons/${id}`),
        CREATE: withVersion("color-seasons"),
        UPDATE: (id: number) => withVersion(`color-seasons/${id}`),
        DELETE: (id: number) => withVersion(`color-seasons/${id}`),
    },
    OCCUPATIONS: {
        LIST: withVersion("occupations"),
        DETAILS: (id: number) => withVersion(`occupations/${id}`),
        CREATE: withVersion("occupations"),
        UPDATE: (id: number) => withVersion(`occupations/${id}`),
        DELETE: (id: number) => withVersion(`occupations/${id}`),
    },
    COLORS: {
        LIST: withVersion("colors"),
        DETAILS: (id: number) => withVersion(`colors/${id}`),
        CREATE: withVersion("colors"),
        UPDATE: (id: number) => withVersion(`colors/${id}`),
        DELETE: (id: number) => withVersion(`colors/${id}`),
    },
    WAREHOUSES: {
        LIST: withVersion("warehouses"),
        DETAILS: (id: number) => withVersion(`warehouses/${id}`),
        CREATE: withVersion("warehouses"),
        UPDATE: (id: number) => withVersion(`warehouses/${id}`),
        DELETE: (id: number) => withVersion(`warehouses/${id}`),
    },
    SIZES: {
        LIST: withVersion("sizes"),
        DETAILS: (id: number) => withVersion(`sizes/${id}`),
        CREATE: withVersion("sizes"),
        UPDATE: (id: number) => withVersion(`sizes/${id}`),
        DELETE: (id: number) => withVersion(`sizes/${id}`),
    },
    TAGS: {
        LIST: withVersion("tags"),
        DETAILS: (id: number) => withVersion(`tags/${id}`),
        CREATE: withVersion("tags"),
        UPDATE: (id: number) => withVersion(`tags/${id}`),
        DELETE: (id: number) => withVersion(`tags/${id}`),
    },
    CONFIGURATIONS: {
        LIST: withVersion("configurations"),
        UPDATE: withVersion(`configurations`),
    },
    PRODUCTS: {
        LIST: withVersion("products"),
        DETAILS: (id: number) => withVersion(`products/${id}`),
        CREATE: withVersion("products"),
        UPDATE: (id: number) => withVersion(`products/${id}`),
        DELETE: (id: number) => withVersion(`products/${id}`),
        GENERATE_BARCODE: withVersion("products/generate-barcode"),
        PRINT_BARCODES: (id: number) => withVersion(`products/${id}/barcodes/print`),
        EXPORT_TEMPLATE: withVersion("products/export-template"),
        EXPORT_SELECTED: withVersion("products/export-selected"),
        IMPORT: withVersion("products/import"),
        IMPORT_VALIDATE: withVersion("products/import_validate"),
        BULK_UPDATE: withVersion("products/bulk-update"),

    },
    PRODUCT_IMAGES: {
        UPDATE: (id: number) => withVersion(`product_image/${id}`),
        DELETE: (id: number) => withVersion(`product_image/${id}`),
    },
    VARIANT_IMAGES: {
        UPDATE: (id: number) => withVersion(`variant_image/${id}`),
        DELETE: (id: number) => withVersion(`variant_image/${id}`),
    },
    PRODUCT_VARIANT: {
        DELETE: (id: number) => withVersion(`product_variant/${id}`),
        LIST: withVersion("getAllProductsVariants"),
        ORDERABLE_VARIANTS: withVersion("getOrderableVariants"),
        ORDERABLE_VARIANTS_CAN_BE_PREORDER: withVersion("getAllProductsVariantsCanBePreOrder"),


    },
    STOCKS: {
        LIST: withVersion("stocks"),
    },

    STOCK_ADJUSTMENTS: {
        LIST: withVersion("stock-adjustments"),
        DETAILS: (id: number) => withVersion(`stock-adjustments/${id}`),
        CREATE_MANUAL: withVersion("stock-adjustments/manual"),
        DELETE: (id: number) => withVersion(`stock-adjustments/${id}`),
    },

    CLIENTS: {
        LIST: withVersion("clients"),
        DETAILS: (id: number) => withVersion(`clients/${id}`),
        CREATE: withVersion("clients"),
        UPDATE: (id: number) => withVersion(`clients/${id}`),
        DELETE: (id: number) => withVersion(`clients/${id}`),
    },

    ADDRESSES: {
        LIST: withVersion("addresses"),
        DETAILS: (id: number) => withVersion(`addresses/${id}`),
        CREATE: withVersion("addresses"),
        UPDATE: (id: number) => withVersion(`addresses/${id}`),
        DELETE: (id: number) => withVersion(`addresses/${id}`),
    },

    COUPONS: {
        LIST: withVersion("coupons"),
        DETAILS: (id: number) => withVersion(`coupons/${id}`),
        CREATE: withVersion("coupons"),
        UPDATE: (id: number) => withVersion(`coupons/${id}`),
        DELETE: (id: number) => withVersion(`coupons/${id}`),
    },

    ORDERS: {
        LIST: withVersion("orders"),
        DETAILS: (id: number) => withVersion(`orders/${id}`),
        CREATE: withVersion("orders"),
        UPDATE: (id: number) => withVersion(`orders/${id}`),
        RECEIPT: (id: number) => withVersion(`orders/${id}/receipt`),
    },
    RETURN_ORDERS: {
        LIST: withVersion("return-orders"),
        DETAILS: (id: number) => withVersion(`return-orders/${id}`),
        CREATE: withVersion("return-orders"),
        UPDATE: (id: number) => withVersion(`return-orders/${id}`),
    },
    PRE_ORDERS: {
        LIST: withVersion("pre-orders"),
        DETAILS: (id: number) => withVersion(`pre-orders/${id}`),
        CREATE: withVersion("pre-orders"),
        UPDATE: (id: number) => withVersion(`pre-orders/${id}`),

    },
    LEARNING_VIDEOS: {
        LIST: withVersion("learning-videos"),
        DETAILS: (id: number) => withVersion(`learning-videos/${id}`),
        CREATE: withVersion("learning-videos"),
        UPDATE: (id: number) => withVersion(`learning-videos/${id}`),
        DELETE: (id: number) => withVersion(`learning-videos/${id}`),
    },

    HOME_SECTIONS: {
        LIST: withVersion("home-sections"),
        DETAILS: (id: number) => withVersion(`home-sections/${id}`),
        CREATE: withVersion("home-sections"),
        UPDATE: (id: number) => withVersion(`home-sections/${id}`),
        DELETE: (id: number) => withVersion(`home-sections/${id}`),
        DELETE_BANNER_ITEM: (id: number, bannerItem: number) => withVersion(`home-sections/${id}banner-items/${bannerItem}`),
    },

    SUBSCRIPTION_PLANS: {
        LIST: withVersion("subscription-plan"),
        DETAILS: (id: number) => withVersion(`subscription-plan/${id}`),
        CREATE: withVersion("subscription-plan"),
        UPDATE: (id: number) => withVersion(`subscription-plan/${id}`),
        DELETE: (id: number) => withVersion(`subscription-plan/${id}`),
    },

    SUBSCRIPTIONS: {
        LIST: withVersion("subscription"),
        UPDATE: (id: number) => withVersion(`subscription/${id}`),
    },

    CONTACTS: {
        LIST: withVersion("contacts"),
    },

    TEAM_MEMBERS: {
        LIST: withVersion("team-members"),
        DETAILS: (id: number) => withVersion(`team-members/${id}`),
        CREATE: withVersion("team-members"),
        UPDATE: (id: number) => withVersion(`team-members/${id}`),
        DELETE: (id: number) => withVersion(`team-members/${id}`),
    },
    HOME_BANNERS: {
        DELETE: (id: number) => withVersion(`home_banners/${id}`),
    },
    REVIEWS: {
        LIST: withVersion("reviews"),
        UPDATE: (id: number) => withVersion(`reviews/${id}`),
    },
    CURRENCIES: {
        LIST: withVersion("currencies"),
        DETAILS: (id: number) => withVersion(`currencies/${id}`),
        CREATE: withVersion("currencies"),
        UPDATE: (id: number) => withVersion(`currencies/${id}`),
        DELETE: (id: number) => withVersion(`currencies/${id}`),
    },
    PAGES: {
        LIST: withVersion("pages"),
        DETAILS: (id: number) => withVersion(`pages/${id}`),
        UPDATE: (id: number) => withVersion(`pages/${id}`),
    },
    REPORTS: {
        SALES: withVersion("reports/sales"),
        PRODUCTS: withVersion("reports/products"),
        CATEGORIES: withVersion("reports/categories"),
        CLIENTS: withVersion("reports/clients"),
        PAYMENTS: withVersion("reports/payments"),
        REFUNDS: withVersion("reports/refunds"),
        DELIVERY_PERFORMANCE: withVersion("reports/delivery-performance"),
    },
    PROMOTIONAL_EMAILS: {
        STATS: withVersion("promotional-emails/stats"),
        SUBSCRIBERS: withVersion("promotional-emails/subscribers"),
        SEND: withVersion("promotional-emails/send"), // New unified endpoint
        PREVIEW: withVersion("promotional-emails/preview"),
        TEMPLATES: withVersion("promotional-emails/templates"),
        RECIPIENT_COUNT: withVersion("promotional-emails/recipient-count"),
        // Legacy endpoints (kept for backward compatibility)
        SEND_TO_ALL: withVersion("promotional-emails/send-to-all"),
        SEND_TO_SPECIFIC: withVersion("promotional-emails/send-to-specific"),
        SEND_WITH_PRODUCTS: withVersion("promotional-emails/send-with-products"),
        UNSUBSCRIBE: withVersion("promotional-emails/unsubscribe"),
    },
};

export default API_ENDPOINTS;
