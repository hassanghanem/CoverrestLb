import { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useLocation, useSearchParams } from 'react-router-dom';

// Faster speed settings
NProgress.configure({ showSpinner: false, speed: 200, minimum: 0.2,});

export default function ProgressBar() {
    const location = useLocation();

    const searchParams = useSearchParams();

    useEffect(() => {
        NProgress.start();

        // Adding a small delay before stopping to make the animation smoother
        const timer = setTimeout(() => NProgress.done(), 100);

        return () => {
            clearTimeout(timer);
            NProgress.done(); // Make sure it's stopped if unmounted
        };
    }, [location, searchParams]);

    return null;
}
