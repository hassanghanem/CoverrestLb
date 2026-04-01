
import { Toaster } from "sonner";

import i18n from "./i18n";
import {
  BrowserRouter,
  Routes as ReactRouterRoutes,
  Route as ReactRouterRoute,
  Navigate
} from 'react-router-dom';
import { lazy, Suspense, useEffect } from "react";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import CookieConsent from "./components/CookieConsent";
const NotFoundError = lazy(() => import('./features/Errors/NotFoundError'));
const ForbiddenError = lazy(() => import('./features/Errors/ForbiddenError'));
const Home = lazy(() => import("./features/Home"));
const ProductDetail = lazy(() => import('./features/ProductDetail'));

const ProvidersLazy = lazy(() => import('./components/providers/provider'));
const SpinnerLazy = lazy(() => import('./components/StaticFullPageSpinner'));
const Shop = lazy(() => import('./features/Shop'));

const Login = lazy(() => import('./features/Auth/Login'));
const OAuthCallback = lazy(() => import('./features/Auth/OAuthCallback'));
const OAuthError = lazy(() => import('./features/Auth/OAuthError'));
const MagicLinkVerify = lazy(() => import('./features/Auth/MagicLinkVerify'));

const Cart = lazy(() => import('./features/Cart'));
const Checkout = lazy(() => import('./features/Checkout'));
const OrderConfirmation = lazy(() => import('./features/OrderConfirmation'));
const Profile = lazy(() => import('./features/Profile'));
const OrderDetail = lazy(() => import('./features/OrderDetail'));
const PreOrderDetail = lazy(() => import('./features/PreOrderDetail'));

const Wishlist = lazy(() => import('./features/Wishlist'));

const Contact = lazy(() => import('./features/Contact'));
const About = lazy(() => import('./features/About'));
const Terms = lazy(() => import('./features/Terms'));
const Privacy = lazy(() => import('./features/Privacy'));
const ReturnPolicy = lazy(() => import('./features/ReturnPolicy'));


const FAQ = lazy(() => import('./features/FAQ'));

const App = () => {
  const lang = i18n.language || 'en';
  const isArabic = lang === 'ar';
  const direction = isArabic ? 'rtl' : 'ltr';

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('lang', lang);
    htmlElement.setAttribute('dir', direction);
  }, [lang, direction]);
  
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'magicLinkVerified' && event.newValue === 'true') {
        
        window.location.href = '/'; 
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);



  return (
    <Suspense fallback={<SpinnerLazy />}>
      <ProvidersLazy>
        <BrowserRouter>
          <Suspense fallback={<SpinnerLazy />}>
            <ReactRouterRoutes>
              <ReactRouterRoute path="/home" element={<Navigate to="/" replace />} />
              {/* forbidden page rendered without Layout */}
              <ReactRouterRoute path="forbidden" element={<ForbiddenError />} />

              <ReactRouterRoute element={<Layout />}>

                <ReactRouterRoute index path="/" element={<Home />} />
                <ReactRouterRoute path="product/:slug" element={<ProductDetail />} />
                <ReactRouterRoute path="shop" element={<Shop />} />
                <ReactRouterRoute path="login" element={<Login />} />
                <ReactRouterRoute path="auth/magic-link/:token" element={<MagicLinkVerify />} />
                <ReactRouterRoute path="auth/callback" element={<OAuthCallback />} />
                <ReactRouterRoute path="auth/error" element={<OAuthError />} />

                <ReactRouterRoute path="contact" element={<Contact />} />
                <ReactRouterRoute path="about-us" element={<About />} />
                <ReactRouterRoute path="terms-conditions" element={<Terms />} />
                <ReactRouterRoute path="privacy-policy" element={<Privacy />} />
                <ReactRouterRoute path="return-policy" element={<ReturnPolicy />} />
                <ReactRouterRoute path="faq" element={<FAQ />} />

                <ReactRouterRoute path="cart" element={<ProtectedRoute ><Cart /></ProtectedRoute>} />
                <ReactRouterRoute path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <ReactRouterRoute path="order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
                <ReactRouterRoute path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <ReactRouterRoute path="order/:orderId" element={<OrderDetail />} />
                <ReactRouterRoute path="pre_order/:orderId" element={<PreOrderDetail />} />
                <ReactRouterRoute path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <ReactRouterRoute path="*" element={<NotFoundError />} />
              </ReactRouterRoute>
            </ReactRouterRoutes>
          </Suspense>
          <CookieConsent />
          <Toaster expand position={`top-${isArabic ? 'left' : 'right'}`} richColors />

        </BrowserRouter>
      </ProvidersLazy>
    </Suspense>
  );
};

export default App;
