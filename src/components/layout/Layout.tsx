import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import { useTheme } from '../../context/ThemeContext';

const Layout: React.FC = () => {
  useScrollToTop();
  const { isDarkMode } = useTheme();

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