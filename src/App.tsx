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
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { RegionProvider } from './context/RegionContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <RegionProvider>
            <Router>
              <CartProvider>
                <WishlistProvider>
                  {/* Main Site Routes */}
                  <Routes>
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="customers" element={<AdminCustomers />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>

                    {/* Site Routes */}
                    <Route path="/" element={<Layout />}>
                      <Route index element={<HomePage />} />
                      <Route path="catalog/:category?" element={<CatalogPage />} />
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
                  </Routes>
                </WishlistProvider>
              </CartProvider>
            </Router>
          </RegionProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;