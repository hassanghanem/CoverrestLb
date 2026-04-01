import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "@/lib/store/store";
import Footer from "@/components/layout/Footer";
import ProgressBar from "@/components/public/ProgressBar";


export default function AuthLayout() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
   
        <ProgressBar />
        <Outlet />
    
      <Footer />
    </div>
  );
}