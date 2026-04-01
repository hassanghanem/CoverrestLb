import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "@/lib/store/store";


export default function AuthLayout({ children }: { children?: React.ReactNode }) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className=" flex items-center justify-center mt-10 mb-10 ">
      <div className="container mx-auto container-padding">

        {children}

      </div>
    </div>
  );
}