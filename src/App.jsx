import { ErrorBoundary } from './components/common/ErrorBoundary';
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { HomePage } from './pages/customer/HomePage';
import { CatalogPage } from './pages/customer/CatalogPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { WishlistPage } from './pages/customer/WishlistPage';
import { UserOrdersPage } from './pages/customer/UserOrdersPage';
import { MerchantPlansPage } from './pages/customer/MerchantPlansPage';
import { DynamicStorefrontPage } from './pages/customer/DynamicStorefrontPage';
import { UserLoginPage } from './pages/UserLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Merchant Admin Context & Pages
import { MerchantAdminProvider } from './context/MerchantAdminContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminAddProduct } from './pages/admin/AdminAddProduct';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminDiscounts } from './pages/admin/AdminDiscounts';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminChannels } from './pages/admin/AdminChannels';
import { AdminThemes } from './pages/admin/channels/AdminThemes';
import { AdminThemeBuilder } from './pages/admin/channels/AdminThemeBuilder';
import { AdminDomains } from './pages/admin/channels/AdminDomains';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminInvoiceSettings } from './pages/admin/AdminInvoiceSettings';

// Super Admin Master Portal
import { SuperAdminProvider } from './context/SuperAdminContext';
import { SuperAdminLayout } from './components/super-admin/SuperAdminLayout';
import { OverviewPage } from './pages/super-admin/OverviewPage';
import { TenantsPage } from './pages/super-admin/TenantsPage';
import { PlansPage } from './pages/super-admin/PlansPage';
import { RevenuePage } from './pages/super-admin/RevenuePage';
import { ThemesPage } from './pages/super-admin/ThemesPage';
import { InvoiceTemplatesPage } from './pages/super-admin/InvoiceTemplatesPage';
import { AnalyticsPage } from './pages/super-admin/AnalyticsPage';
import { GMVPage } from './pages/super-admin/GMVPage';
import { AuditLogsPage } from './pages/super-admin/AuditLogsPage';
import { MerchantsPage } from './pages/super-admin/MerchantsPage';
import { NotificationsPage } from './pages/super-admin/NotificationsPage';
import { SettingsPage } from './pages/super-admin/SettingsPage';
import { useAuth } from './context/AuthContext';

// Protected Admin Route (Merchant Console)
const ProtectedAdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Protected Super Admin Route (Restricted strictly to Master Super Admin)
const ProtectedSuperAdminRoute = ({ children }) => {
  const { currentUser, isSuperAdmin } = useAuth();
  if (!currentUser || !isSuperAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

export const App = () => {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const isAdminPath = location.pathname.startsWith('/admin') && !isSuperAdminPath;
  const isStorefrontRoute = location.pathname.startsWith('/store');
  const isCheckoutRoute = location.pathname.includes('/checkout');
  const isDedicatedConsole = isSuperAdminPath || isAdminPath || isStorefrontRoute || isCheckoutRoute;
  // The login/landing page (also at "/") renders its own header — hide the shared Navbar there
  const isAdminLoginPage = location.pathname === '/' || location.pathname === '/admin/login';

  return (
    <div className="min-h-screen flex flex-col bg-[#fedddd] text-[#0F172A] font-sans selection:bg-[#BE123C]/20 selection:text-[#881337]">
      {/* Customer Storefront Navbar */}
      {!isDedicatedConsole && !isAdminLoginPage && <Navbar />}
      <Toast />

      <main className="flex-1">
        <Routes>
          {/* Dynamic Merchant Storefront (Internal Dynamic Route) */}
          <Route path="/store/:subdomain" element={<ErrorBoundary><DynamicStorefrontPage /></ErrorBoundary>} />
          <Route path="/store/:subdomain/catalog" element={<CatalogPage />} />
          <Route path="/store/:subdomain/product/:id" element={<ProductDetailPage />} />
          <Route path="/store/:subdomain/cart" element={<ErrorBoundary><CartPage /></ErrorBoundary>} />
          <Route path="/store/:subdomain/checkout" element={<ErrorBoundary><CheckoutPage /></ErrorBoundary>} />

          {/* Customer / D2C Platform Routes */}
          <Route path="/" element={<AdminLoginPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<ErrorBoundary><CheckoutPage /></ErrorBoundary>} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/orders" element={<UserOrdersPage />} />
          <Route path="/pricing" element={<MerchantPlansPage />} />
          <Route path="/plans" element={<MerchantPlansPage />} />
          <Route path="/login" element={<UserLoginPage />} />

          {/* Admin / Merchant Console Authentication (dedicated merchant login) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Merchant Console Portal (All 8 Core Modules) */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <ErrorBoundary>
                  <MerchantAdminProvider>
                    <AdminLayout />
                  </MerchantAdminProvider>
                </ErrorBoundary>
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminAddProduct />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="discounts" element={<AdminDiscounts />} />
            <Route path="coupons" element={<AdminDiscounts />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="channels" element={<AdminChannels />} />
            <Route path="themes" element={<AdminThemes />} />
            <Route path="themes/builder" element={<AdminThemeBuilder />} />
            <Route path="channels/online-store/themes" element={<AdminThemes />} />
            <Route path="channels/themes" element={<AdminThemes />} />
            <Route path="channels/online-store/themes/builder" element={<AdminThemeBuilder />} />
            <Route path="channels/themes/builder" element={<AdminThemeBuilder />} />
            <Route path="channels/online-store/domains" element={<AdminDomains />} />
            <Route path="channels/domains" element={<AdminDomains />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="settings/invoices" element={<AdminInvoiceSettings />} />
            <Route path="invoices" element={<AdminInvoiceSettings />} />
          </Route>

          {/* Super Admin Master Portal (11 Modules) — STRICTLY RESTRICTED */}
          <Route
            path="/super-admin"
            element={
              <ProtectedSuperAdminRoute>
                <ErrorBoundary>
                  <SuperAdminProvider>
                    <SuperAdminLayout />
                  </SuperAdminProvider>
                </ErrorBoundary>
              </ProtectedSuperAdminRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="themes" element={<ThemesPage />} />
            <Route path="invoices" element={<InvoiceTemplatesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="gmv" element={<GMVPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="merchants" element={<MerchantsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Customer Storefront Footer */}
      {!isDedicatedConsole && <Footer />}
    </div>
  );
};

export default App;
