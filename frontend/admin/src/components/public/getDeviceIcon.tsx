import { Smartphone, Monitor, Globe, Laptop } from "lucide-react";


export const getDeviceIcon = (_device: string, isMobile: boolean, isTablet: boolean, isDesktop: boolean) => {
    if (isMobile) return <Smartphone className="h-5 w-5" />;
    if (isTablet) return <Monitor className="h-5 w-5" />;
    if (isDesktop) return <Laptop className="h-5 w-5" />;
    return <Globe className="h-5 w-5" />;
};
