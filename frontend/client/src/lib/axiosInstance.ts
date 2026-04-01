import axios, { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import API_ENDPOINTS from './api-endpoints';
import i18n from 'i18next';
import { toast } from 'sonner';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { clearAllStorage } from '@/utils/clearAllStorage';

export const axiosInstance = axios.create({
    baseURL: API_ENDPOINTS.BASE_URL,
    withCredentials: true,
    withXSRFToken: true,
});

let deviceIdPromise: Promise<string> | null = null;

export const getOrCreateDeviceId = async (): Promise<string> => {
    // Memoize so the ID is generated only once per page lifecycle
    if (!deviceIdPromise) {
        deviceIdPromise = (async () => {
            let deviceId: string | null = null;
            try {
                deviceId = localStorage.getItem('device_id');
            } catch {
                // If localStorage is unavailable, fall back to in‑memory only
            }

            if (!deviceId) {
                try {
                    const fp = await FingerprintJS.load();
                    const result = await fp.get();
                    deviceId = result.visitorId;
                } catch {
                    deviceId = crypto.randomUUID();
                }

                try {
                    localStorage.setItem('device_id', deviceId);
                } catch {
                    // Ignore storage errors; deviceId will still be stable for this session
                }
            }

            return deviceId as string;
        })();
    }

    return deviceIdPromise;
};



const onRequest = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const APP_KEY = import.meta.env.VITE_APP_KEY;
    const token = localStorage.getItem("Authorization");
    const language = i18n.language || 'en';
    const userAgent = navigator.userAgent;
    const deviceId = await getOrCreateDeviceId();

    const trackingData = {
        user_agent: userAgent,
        device_id: deviceId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        page: window.location.href,
        referrer: document.referrer,
    };
    config.headers = new AxiosHeaders({
        Authorization: token ? `Bearer ${token}` : '',
        'Accept-Language': language,
        'X-Tracking-Data': JSON.stringify(trackingData),
        'App-key': APP_KEY,
        'agent': userAgent,
        'X-Device-ID': deviceId,
        ...config.headers,
    });

    return config;
};

axiosInstance.interceptors.request.use(onRequest);


axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            toast.error('Session expired!');
            clearAllStorage();
            setTimeout(() => window.location.href = '/', 1000);
        }
        if (error.response?.status === 403) {
            // If we're already on the forbidden page, don't clear storage or redirect again.
            if (window.location.pathname !== '/forbidden') {
                toast.error('Access forbidden!');
                clearAllStorage();
                setTimeout(() => {
                    window.location.href = '/forbidden';
                }, 1000);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
