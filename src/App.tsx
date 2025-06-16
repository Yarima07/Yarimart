import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CatalogPage from './pages/CatalogPage';
import AuthPage from './pages/AuthPage';
import AboutPage from './pages/AboutPage';
import LocationsPage from './pages/LocationsPage';
import CareersPage from './pages/CareersPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import WishlistPage from './pages/WishlistPage';
import ErrorBoundary from './components/ErrorBoundary';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { RegionProvider } from './context/RegionContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { isSupabaseConfigured } from './lib/supabase';

// Admin pages - only load if Supabase is configured
let AdminLayout: React.ComponentType<any> | null = null;
let AdminDashboard: React.ComponentType<any> | null = null;
let AdminOrders: React.ComponentType<any> | null = null;
let AdminProducts: React.ComponentType<any> | null = null;
let AdminCustomers: React.ComponentType<any> | null = null;
let AdminAnalytics: React.ComponentType<any> | null = null;
let AdminSettings: React.ComponentType<any> | null = null;

// Lazy load admin components only if Supabase is configured
if (isSupabaseConfigured()) {
  try {
    const adminModules = await Promise.all([
      import('./pages/admin/AdminLayout'),
      import('./pages/admin/AdminDashboard'),
      import('./pages/admin/AdminOrders'),
      import('./pages/admin/AdminProducts'),
      import('./pages/admin/AdminCustomers'),
      import('./pages/admin/AdminAnalytics'),
      import('./pages/admin/AdminSettings')
    ]);
    
    AdminLayout = adminModules[0].default;
    AdminDashboard = adminModules[1].default;
    AdminOrders = adminModules[2].default;
    AdminProducts = adminModules[3].default;
    AdminCustomers = adminModules[4].default;
    AdminAnalytics = adminModules[5].default;
    AdminSettings = adminModules[6].default;
  } catch (error) {
    console.warn('Admin components could not be loaded:', error);
  }
}

// 404 Not Found component
const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
      <a
        href="/"
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
      >
        Go back home
      </a>
    </div>
  </div>
);

// Admin Access Denied component
const AdminAccessDenied: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Admin Panel Unavailable
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        The admin panel is not available in this environment.
      </p>
      <a
        href="/"
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
      >
        Go to Store
      </a>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <RegionProvider>
            <AuthProvider>
              <Router>
                <CartProvider>
                  <WishlistProvider>
                    <Routes>
                      {/* Admin Routes - only if Supabase is configured and components loaded */}
                      {isSupabaseConfigured() && AdminLayout ? (
                        <Route path="/admin" element={<AdminLayout />}>
                          <Route index element={AdminDashboard ? <AdminDashboard /> : <AdminAccessDenied />} />
                          <Route path="orders" element={AdminOrders ? <AdminOrders /> : <AdminAccessDenied />} />
                          <Route path="products" element={AdminProducts ? <AdminProducts /> : <AdminAccessDenied />} />
                          <Route path="customers" element={AdminCustomers ? <AdminCustomers /> : <AdminAccessDenied />} />
                          <Route path="analytics" element={AdminAnalytics ? <AdminAnalytics /> : <AdminAccessDenied />} />
                          <Route path="settings" element={AdminSettings ? <AdminSettings /> : <AdminAccessDenied />} />
                        </Route>
                      ) : (
                        <Route path="/admin/*" element={<AdminAccessDenied />} />
                      )}

                      {/* Main Site Routes */}
                      <Route path="/" element={<Layout />}>
                        <Route index element={<HomePage />} />
                        <Route path="catalog" element={<CatalogPage />} />
                        <Route path="catalog/:category" element={<CatalogPage />} />
                        <Route path="product/:id" element={<ProductPage />} />
                        <Route path="cart" element={<CartPage />} />
                        <Route path="checkout" element={<CheckoutPage />} />
                        <Route path="order-success" element={<OrderSuccessPage />} />
                        <Route path="auth" element={<AuthPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="profile/orders" element={<OrdersPage />} />
                        <Route path="order/:id" element={<OrderDetailsPage />} />
                        <Route path="wishlist" element={<WishlistPage />} />
                        <Route path="about" element={<AboutPage />} />
                        <Route path="locations" element={<LocationsPage />} />
                        <Route path="careers" element={<CareersPage />} />
                        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                        <Route path="terms" element={<TermsPage />} />
                      </Route>

                      {/* Catch-all route for 404 */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </WishlistProvider>
                </CartProvider>
              </Router>
            </AuthProvider>
          </RegionProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;