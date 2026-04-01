import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

type BreadcrumbItem = {
  title: string;
  link: string;
};

const routeMapping: Record<string, BreadcrumbItem[]> = {

};

export function useBreadcrumbs() {
  const { pathname } = useLocation();
  
  const breadcrumbs = useMemo(() => {
    // Handle root path
    if (pathname === '/') return [];
    
    const segments = pathname.split('/').filter(Boolean);
    
    // If we have a direct mapping for the full path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }
    
    // Fallback to dynamic generation
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path
      };
    });
  }, [pathname]);

  return breadcrumbs;
}