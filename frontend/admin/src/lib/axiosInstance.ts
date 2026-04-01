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

const getGeoLocation = (): Promise<{ latitude?: number; longitude?: number }> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return resolve({});
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            }),
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    reject(new Error('Location permission denied'));
                } else {
                    resolve({});
                }
            }
        );
    });
};

const onRequest = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    try {
        const APP_KEY = import.meta.env.VITE_APP_KEY;
        const token = localStorage.getItem('Authorization') || '';
        const team = localStorage.getItem('X-Team-ID') || '';
        const language = i18n.language || 'en';
        const userAgent = navigator.userAgent;
        const deviceId = await getOrCreateDeviceId();
        const { latitude, longitude } = await getGeoLocation();
        const trackingData = {
            user_agent: userAgent,
            device_id: deviceId,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            page: window.location.href,
            referrer: document.referrer,
            latitude,
            longitude,
        };

        const headers: Record<string, string> = {
            'X-Team-ID': team,
            'Accept-Language': language,
            'App-key': APP_KEY,
            'agent': userAgent,
            'X-Device-ID': deviceId,
            'X-Tracking-Data': JSON.stringify(trackingData),
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        config.headers = new AxiosHeaders({
            ...headers,
            ...config.headers,
        });

        return config;
    } catch (err: any) {
        if (err.message === 'Location permission denied') {
            toast.error('Location permission is required to proceed.');
        } else {
            toast.error('Unexpected error while preparing request.');
        }
        return Promise.reject(err);
    }
};


axiosInstance.interceptors.request.use(onRequest);
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            toast.error('Session expired!');
            clearAllStorage();
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
