import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { AppDispatch, RootState } from '@/lib/store/store';
import { ReactNode, useEffect } from 'react';
import { getCurrentUser } from '@/lib/services/profile-service';
import { logout, setClientData } from '@/lib/store/slices/authSlice';
import { useQuery } from '@tanstack/react-query';


interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useDispatch<AppDispatch>();
  const client = useSelector((state: RootState) => state.auth.client);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const location = useLocation();
  const {
    data,
    isLoading,
    isError,
    isFetched,
  } = useQuery({
    queryKey: ["getCurrentUser"],
    queryFn: getCurrentUser,
    staleTime: 5000,
    enabled: isAuthenticated
  });

  useEffect(() => {
    if (!isLoading && isFetched) {
      if (isError || !data?.result) {
        dispatch(logout())
          .unwrap()
          .finally(() => {
            window.location.href = "/";
          });
      } else {
        dispatch(setClientData(data.client));
      }
    }
  }, [data, isLoading, isError, isFetched, dispatch]);
  if (!client) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }


  return <>{children}</>;
}
