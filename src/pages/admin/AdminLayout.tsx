import React, { useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Settings, Package, Users, Layers, ShoppingBag, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout: React.FC = () => {
  const { user, signOut, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  // Check if user has admin role
  useEffect(() => {
    const checkAdminAccess = async () => {
      // Wait until authentication is no longer loading
      if (loading) {
        console.log('[ADMIN-LAYOUT] Auth is still loading, waiting...');
        return;
      }
      
      // Get admin status from localStorage and context
      const storedAdminStatus = localStorage.getItem('isAdmin') === 'true';
      const effectiveIsAdmin = isAdmin || storedAdminStatus;
      
      console.log(`[ADMIN-LAYOUT] Access check - localStorage admin: ${storedAdminStatus}, context admin: ${isAdmin}`);
      console.log(`[ADMIN-LAYOUT] Effective admin status: ${effectiveIsAdmin}`);
      console.log(`[ADMIN-LAYOUT] User email: ${user?.email || 'no user'}`);

      if (!user) {
        console.log('[ADMIN-LAYOUT] No user found, redirecting to auth');
        navigate('/auth');
        return;
      }
      
      if (!effectiveIsAdmin) {
        console.log('[ADMIN-LAYOUT] User is not an admin, redirecting to home');
        navigate('/');
        return;
      }
      
      console.log('[ADMIN-LAYOUT] Admin access confirmed');
    };
    
    checkAdminAccess();
  }, [user, isAdmin, navigate, loading]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigationItems = [
    { name: 'Dashboard', icon: Layers, path: '/admin' },
    { name: 'Orders', icon: Package, path: '/admin/orders' },
    { name: 'Products', icon: ShoppingBag, path: '/admin/products' },
    { name: 'Customers', icon: Users, path: '/admin/customers' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  // Show a loading state while checking admin status
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Admin Panel</h1>
        </div>
        
        <div className="overflow-y-auto">
          <nav className="mt-5 px-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-64 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSignOut}
            className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 w-full"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {navigationItems.find(item => window.location.pathname === item.path)?.name || 'Admin'}
            </h2>
          </div>
        </header>
        
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;