export const clearAllStorage = () => {
    const deviceId = localStorage.getItem('device_id');
    const cookieConsent =
        localStorage.getItem('cookie_consent');
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    if (deviceId) {
        localStorage.setItem('device_id', deviceId);
    }

    if (cookieConsent) {
        localStorage.setItem('cookie_consent', cookieConsent);
    }
};
