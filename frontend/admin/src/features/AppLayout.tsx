import AppSidebar from "@/components/layout/app-sidebar";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/header";
import ProgressBar from "@/components/public/ProgressBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { getCurrentUser } from "@/lib/services/Profile-services";
import { logout, setUserData } from "@/lib/store/slices/authSlice";
import { RootState, AppDispatch } from "@/lib/store/store";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function AppLayout() {
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const {
        data,
        isLoading,
        isError,
        isFetched,
    } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        staleTime: 1000 * 60 * 1,
        retry: 1,
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
                dispatch(setUserData(data.user));
            }
        }
    }, [data, isLoading, isError, isFetched, dispatch]);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const defaultOpen = Cookies.get("sidebar:state") !== "false";

    return (
        <NotificationsProvider>
            <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar />
                <SidebarInset className="overflow-x-hidden">
                    <Header />
                    <Outlet />
                    <Footer />
                </SidebarInset>
                <ProgressBar />
            </SidebarProvider>
        </NotificationsProvider>
    );
}
