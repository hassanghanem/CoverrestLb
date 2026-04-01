export const clearAllStorage = async () => {
    // Save the values to preserve
    const deviceId = localStorage.getItem('device_id');
    const cookieConsent = localStorage.getItem('cookie_consent');

    // Clear localStorage except the preserved keys
    localStorage.clear();
    if (deviceId) localStorage.setItem('device_id', deviceId);
    if (cookieConsent) localStorage.setItem('cookie_consent', cookieConsent);

    // Clear sessionStorage entirely
    sessionStorage.clear();

    // Clear all cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    // Async placeholder for future async operations if needed
    await Promise.resolve();
};