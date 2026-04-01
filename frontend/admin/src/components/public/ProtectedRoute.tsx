import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '@/lib/store/store';
import { ReactNode } from 'react';
import UnauthorisedError from '@/features/Errors/UnauthorisedError';


interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
}

export default function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (
    requiredPermission !== undefined &&
    (!Array.isArray(user.permissions) || !user.permissions.includes(requiredPermission))
  ) {
    return <UnauthorisedError />;
  }

  return <>{children}</>;
}
