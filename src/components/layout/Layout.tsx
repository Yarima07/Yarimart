import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Layout: React.FC = () => {
  useScrollToTop();
  const { isDarkMode } = useTheme();
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  // Check if user is an admin and redirect to admin panel if needed
  useEffect(() => {
    if (!loading && isAdmin) {
      console.log('[LAYOUT] Admin user detected in user module, redirecting to admin panel');
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate, loading]);

  // Show loading state while checking auth status
  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDarkMode ? 'dark' : ''}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Navbar />
      <main className="flex-grow dark:bg-gray-900">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;