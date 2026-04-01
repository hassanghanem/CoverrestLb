import Header from "./Header";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSettings } from "@/hooks/usePublicData";
import StaticFullPageSpinner from "../StaticFullPageSpinner";
import { useDynamicTheme } from "@/hooks/useDynamicTheme";
import WhatsAppFloat from "../WhatsAppFloat";

const Layout = () => {

  const { pathname } = useLocation();
  const { data: settingsData, isLoading } = useSettings();

  const configurations = settingsData?.configurations || [];

  const theme_color1 = configurations.find(item => item.key === 'theme_color1')?.value;
  const theme_color2 = configurations.find(item => item.key === 'theme_color2')?.value;
  useDynamicTheme(theme_color1, theme_color2);

  useEffect(() => {
    const element = document.getElementById('root');
    element?.scrollIntoView({ behavior: 'auto' });
  }, [pathname]);



  if (isLoading) {
    return <StaticFullPageSpinner />;
  }
  return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <WhatsAppFloat />
      </div>
  );
};

export default Layout;
