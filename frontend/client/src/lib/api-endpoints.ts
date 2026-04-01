
const BASE_URL = import.meta.env.VITE_BASE_URL;
const VERSION = import.meta.env.VITE_API_VERSION;

const withVersion = (path: string) => `/api/${VERSION}/client/${path}`;

const API_ENDPOINTS = {
    BASE_URL: BASE_URL,
    CAPTCHA: {
        GENERATE: `/api/${VERSION}/captcha-token`,
    },
    HOME: {
        LIST: withVersion("home"),
    },
    SHOP: {
        LIST: withVersion("shop"),
    },
    AUTH: {
        SEND_MAGIC_LINK: withVersion("send-magic-link"),
        VERIFY_MAGIC_LINK: (token: string) => withVersion(`verify-magic-link/${token}`),
        GOOGLE_REDIRECT: withVersion("auth/google"),
        LOGOUT: withVersion("logout"),
    },
    PROFILE: {
        GET_CUREENT_USER: withVersion("getCurrentUser"),
        UPDATE: withVersion("updateProfile"),
        DELETE: withVersion("deleteAccount"),

    },

    SETTINGS: {
        LIST: withVersion("allSettings"),
    },

    CATEGORIES: {
        LIST: withVersion("categories"),
    },
    BRANDS: {
        LIST: withVersion("brands"),
    },


    COLORS: {
        LIST: withVersion("colors"),
    },

    TAGS: {
        LIST: withVersion("tags"),
    },
    CONFIGURATIONS: {
        LIST: withVersion("configurations"),
    },
    PRODUCT: {
        DETAILS: (slug: string) => withVersion(`product/${slug}`),
    },
    PRODUCTS: {
        LIST: withVersion("products"),
    },
    PRODUCT_VARIANT: {
        LIST: withVersion("getAllProductsVariants"),
    },

    ADDRESSES: {
        LIST: withVersion("addresses"),
        DETAILS: (id: number) => withVersion(`addresses/${id}`),
        CREATE: withVersion("addresses"),
        DEFAULT: withVersion("addresses/default"),

        UPDATE: (id: number) => withVersion(`addresses/${id}`),
        DELETE: (id: number) => withVersion(`addresses/${id}`),
    },

    COUPONS: {
        LIST: withVersion("coupons"),
    },

    ORDERS: {
        LIST: withVersion("orders"),
        DETAILS: (id: number) => withVersion(`orders/${id}`),
    },
    RETURN_ORDERS: {
        LIST: withVersion("return-orders"),
        DETAILS: (id: number) => withVersion(`return-orders/${id}`),
        CREATE: withVersion("return-orders"),
    },
    PRE_ORDERS: {
        LIST: withVersion("pre-orders"),
        DETAILS: (id: number) => withVersion(`pre-orders/${id}`),
    },
    CONTACTS: {
        CREATE: withVersion("contact"),
    },

    CART: {
        GET: withVersion("cart"),
        ADD_OR_UPDATE: withVersion("cart/addOrUpdate"),
        REMOVE: withVersion("cart/remove"),
    },
    COUPON: {
        GET: withVersion("coupon"),
        APPLY: withVersion("coupon/apply"),
        REMOVE: withVersion("coupon/remove"),
    },

    CHECKOUT: {
        PLACE_ORDER: withVersion("placeOrder"),

    },

    NEWSLETTER: {
        SUBSCRIBE: withVersion("newsletterSubscribe"),

    },

    WISHLIST: {
        GET: withVersion("wishlist"),
        ADD_OR_REMOVE: withVersion("wishlist/addOrRemove"),
    },
    REVIEWS: {
        LIST: withVersion("reviews"),
        DELETE: (id: number) => withVersion(`reviews/${id}`),
        CREATE: withVersion("reviews"),
        UPDATE: (id: number) => withVersion(`reviews/${id}`),
    },
    TEAM_MEMBERS: {
        LIST: withVersion("team-members"),
    },
};

export default API_ENDPOINTS;
