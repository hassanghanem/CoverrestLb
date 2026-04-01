import { Suspense, lazy, useEffect, useRef } from 'react';
import { Toaster } from 'sonner';
import Providers from './components/providers/provider';
import {
  BrowserRouter,
  Routes as ReactRouterRoutes,
  Route as ReactRouterRoute,
  Navigate,
} from 'react-router-dom';
import i18n from 'i18next';
import { getCsrfCookies } from './lib/services/Sessions-services';
import StaticFullPageSpinner from './components/public/StaticFullPageSpinner';
import CookieConsent from './components/public/CookieConsent';
const SignIn = lazy(() => import('./features/Auth/sign-in'));
const ForgotPassword = lazy(() => import('./features/Auth/forgot-password'));
const Otp = lazy(() => import('./features/Auth/otp'));
const ResetPassword = lazy(() => import('./features/Auth/reset-password'));
const Dashboard = lazy(() => import('./features/Dashboard'));
const Users = lazy(() => import('./features/Users'));
const Profile = lazy(() => import('./features/Profile'));
const Settings = lazy(() => import('./features/Settings'));
const ActivityLogs = lazy(() => import('./features/ActivityLogs'));
const Categories = lazy(() => import('./features/Categories'));
const Products = lazy(() => import('./features/Products'));
const NotFoundError = lazy(() => import('./features/Errors/NotFoundError'));
const AuthLayout = lazy(() => import('./features/Auth/auth-layout'));
const AppLayout = lazy(() => import('./features/AppLayout'));
const ProtectedRoute = lazy(() => import('./components/public/ProtectedRoute'));
const ProductFormView = lazy(() => import('./features/Products/components/ProductFormView'));
const Stocks = lazy(() => import('./features/Stocks'));
const StockAdjustments = lazy(() => import('./features/StockAdjustments'));
const Clients = lazy(() => import('./features/Clients'));
const Addresses = lazy(() => import('./features/Addresses'));
const Coupons = lazy(() => import('./features/Coupons'));
const Orders = lazy(() => import('./features/Orders'));
const OrderView = lazy(() => import('./features/Orders/components/OrderView'));
const ReturnOrders = lazy(() => import('./features/ReturnOrders'));
const ReturnOrderView = lazy(() => import('./features/ReturnOrders/components/ReturnOrderView'));
const PreOrders = lazy(() => import('./features/PreOrders'));
const PreOrderView = lazy(() => import('./features/PreOrders/components/PreOrderView'));
const Contacts = lazy(() => import('./features/Contacts'));
const TeamMember = lazy(() => import('./features/TeamMembers'));
const HomeSections = lazy(() => import('./features/HomeSections'));
const HomeSectionFormViews = lazy(() => import('./features/HomeSections/components/HomeSectionFormView'));
const Reviews = lazy(() => import('./features/Reviews'));
const SalesReport = lazy(() => import("./features/Reports/SalesReport"));
const ProductReport = lazy(() => import("./features/Reports/ProductReport"));
const CategoryReport = lazy(() => import("./features/Reports/CategoryReport"));
const ClientReport = lazy(() => import("./features/Reports/ClientReport"));
const PaymentReport = lazy(() => import("./features/Reports/PaymentReport"));
const RefundsReport = lazy(() => import("./features/Reports/RefundsReport"));
const DeliveryPerformanceReport = lazy(() => import("./features/Reports/DeliveryPerformanceReport"));
const PromotionalEmails = lazy(() => import("./features/PromotionalEmails"));


function App() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      getCsrfCookies();
      hasRun.current = true;
    }
  }, []);

  const lang = i18n.language || 'en';
  const isArabic = lang === 'ar';
  const direction = isArabic ? 'rtl' : 'ltr';

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('lang', lang);
    htmlElement.setAttribute('dir', direction);
  }, [lang, direction]);


  return (
    <Providers>
      <BrowserRouter>
        <Suspense fallback={<StaticFullPageSpinner />}>
          <ReactRouterRoutes>
            <ReactRouterRoute path="/login" element={<Navigate to="/" replace />} />

            <ReactRouterRoute element={<AuthLayout />}>
              <ReactRouterRoute index path="/" element={<SignIn />} />
              <ReactRouterRoute path="resetPassword" element={<ResetPassword />} />
              <ReactRouterRoute path="forgotPassword" element={<ForgotPassword />} />
              <ReactRouterRoute path="otp" element={<Otp />} />
            </ReactRouterRoute>

            <ReactRouterRoute element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <ReactRouterRoute
                path="dashboard"
                element={
                  <ProtectedRoute requiredPermission="view-dashboard">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="users"
                element={
                  <ProtectedRoute requiredPermission="view-user">
                    <Users />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="settings"
                element={
                  <ProtectedRoute requiredPermission="view-settings">
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="profile"
                element={
                  <ProtectedRoute requiredPermission="view-profile">
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="activity-logs"
                element={
                  <ProtectedRoute requiredPermission="view-activity_logs">
                    <ActivityLogs />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="categories"
                element={
                  <ProtectedRoute requiredPermission="view-category">
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="products"
                element={
                  <ProtectedRoute requiredPermission="view-product">
                    <Products />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="products/new"
                element={
                  <ProtectedRoute requiredPermission="create-product">
                    <ProductFormView />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="products/:id/edit"
                element={
                  <ProtectedRoute requiredPermission="edit-product">
                    <ProductFormView />
                  </ProtectedRoute>
                }
              />


              <ReactRouterRoute
                path="stocks"
                element={
                  <ProtectedRoute requiredPermission="view-stock">
                    <Stocks />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="stock-adjustments"
                element={
                  <ProtectedRoute requiredPermission="view-stock_adjustment">
                    <StockAdjustments />
                  </ProtectedRoute>
                }
              />

              <ReactRouterRoute
                path="clients"
                element={
                  <ProtectedRoute requiredPermission="view-client">
                    <Clients />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="clients/:ClientId/addresses"
                element={
                  <ProtectedRoute requiredPermission="view-client">
                    <Addresses />
                  </ProtectedRoute>
                }
              />


              <ReactRouterRoute
                path="coupons"
                element={
                  <ProtectedRoute requiredPermission="view-coupon">
                    <Coupons />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="orders"
                element={
                  <ProtectedRoute requiredPermission="view-order">
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="orders/:OrderId/view"
                element={
                  <ProtectedRoute requiredPermission="view-order">
                    <OrderView />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="return-orders"
                element={
                  <ProtectedRoute requiredPermission="view-return_order">
                    <ReturnOrders />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="return-orders/:ReturnOrderId/view"
                element={
                  <ProtectedRoute requiredPermission="view-return_order">
                    <ReturnOrderView />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="pre-orders"
                element={
                  <ProtectedRoute requiredPermission="view-pre_order">
                    <PreOrders />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="pre-orders/:OrderId/view"
                element={
                  <ProtectedRoute requiredPermission="view-pre_order">
                    <PreOrderView />
                  </ProtectedRoute>
                }
              />

              <ReactRouterRoute
                path="contacts"
                element={
                  <ProtectedRoute requiredPermission="view-contacts">
                    <Contacts />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="promotional-emails"
                element={
                  <ProtectedRoute requiredPermission="view-promotional_emails">
                    <PromotionalEmails />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="team-members"
                element={
                  <ProtectedRoute requiredPermission="view-team_member">
                    <TeamMember />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="home-sections"
                element={
                  <ProtectedRoute requiredPermission="view-home_section">
                    <HomeSections />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="home-sections/new"
                element={
                  <ProtectedRoute requiredPermission="create-home_section">
                    <HomeSectionFormViews />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="home-sections/:id/edit"
                element={
                  <ProtectedRoute requiredPermission="edit-home_section">
                    <HomeSectionFormViews />
                  </ProtectedRoute>
                }
              />
              <ReactRouterRoute
                path="reviews"
                element={
                  <ProtectedRoute requiredPermission="view-review">
                    <Reviews />
                  </ProtectedRoute>
                }
              />
              {/* 🧾 Report Routes */}
              <ReactRouterRoute
                path="reports/sales"
                element={
                  <ProtectedRoute requiredPermission="view-sales_report">
                    <SalesReport />
                  </ProtectedRoute>
                }
              />

              <ReactRouterRoute
                path="reports/products"
                element={
                  <ProtectedRoute requiredPermission="view-product_report">
                    <ProductReport />
                  </ProtectedRoute>
                }
              />

              <ReactRouterRoute
                path="reports/categories"
                element={
                  <ProtectedRoute requiredPermission="view-category_report">
                    <CategoryReport />
                  </ProtectedRoute>
                }
              />

              <ReactRouterRoute
                path="reports/clients"
                element={
                  <ProtectedRoute requiredPermission="view-client_report">
                    <ClientReport />
                  </ProtectedRoute>
                }
              />

              <ReactRouterRoute
                path="reports/payments"
                element={
                  <ProtectedRoute requiredPermission="view-payment_report">
                    <PaymentReport />
                  </ProtectedRoute>
                }
              />

              <ReactRouterRoute
                path="reports/refunds"
                element={
                  <ProtectedRoute requiredPermission="view-refunds_report">
                    <RefundsReport />
                  </ProtectedRoute>
                }
              />

              <ReactRouterRoute
                path="reports/delivery-performance"
                element={
                  <ProtectedRoute requiredPermission="view-delivery_performance_report">
                    <DeliveryPerformanceReport />
                  </ProtectedRoute>
                }
              />

            </ReactRouterRoute>

            <ReactRouterRoute path="*" element={<NotFoundError />} />
          </ReactRouterRoutes>
        </Suspense>
      </BrowserRouter>
      <CookieConsent />
      <Toaster expand position={`top-${isArabic ? 'left' : 'right'}`} richColors />
    </Providers>
  );
}

export default App;

