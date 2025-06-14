import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Settings, Package, Users, Layers, ShoppingBag, LogOut, 
  Menu, X, Bell, Search, Moon, Sun, ChevronDown, ChevronRight,
  Home, BarChart3, FileText, HelpCircle, Keyboard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const AdminLayout: React.FC = () => {
  const { user, signOut, isAdmin, loading } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  
  // Enhanced notifications with order-specific icons and types
  const [notifications] = useState([
    { 
      id: 1, 
      type: 'order',
      message: 'New order #12345678 received',
      details: 'Order total: ₹15,999 - Professional Impact Drill',
      time: '2 min ago', 
      unread: true,
      priority: 'high'
    },
    { 
      id: 2, 
      type: 'order',
      message: 'Order #12345677 shipped',
      details: 'Tracking: TRK123456789',
      time: '15 min ago', 
      unread: true,
      priority: 'normal'
    },
    { 
      id: 3, 
      type: 'order',
      message: 'Payment pending for order #12345676',
      details: 'Bank transfer verification required',
      time: '1 hour ago', 
      unread: true,
      priority: 'high'
    },
    { 
      id: 4, 
      type: 'inventory',
      message: 'Low stock alert: Safety Helmets',
      details: 'Only 3 units remaining',
      time: '2 hours ago', 
      unread: false,
      priority: 'normal'
    },
    { 
      id: 5, 
      type: 'system',
      message: 'Monthly report is ready',
      details: 'Revenue and sales analytics available',
      time: '3 hours ago', 
      unread: false,
      priority: 'low'
    }
  ]);

  // Check admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (loading) return;
      
      const storedAdminStatus = localStorage.getItem('isAdmin') === 'true';
      const effectiveIsAdmin = isAdmin || storedAdminStatus;

      if (!user) {
        console.log('[ADMIN-LAYOUT] No user found, redirecting to auth');
        navigate('/auth', { replace: true });
        return;
      }
      
      if (!effectiveIsAdmin) {
        console.log('[ADMIN-LAYOUT] User is not admin, redirecting to home');
        navigate('/', { replace: true });
        return;
      }
    };
    
    checkAdminAccess();
  }, [user, isAdmin, navigate, loading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-dropdown')) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '/':
            e.preventDefault();
            document.getElementById('admin-search')?.focus();
            break;
          case 'b':
            e.preventDefault();
            setSidebarCollapsed(!sidebarCollapsed);
            break;
          case 'h':
            e.preventDefault();
            navigate('/admin');
            break;
          case '?':
            e.preventDefault();
            setShowKeyboardShortcuts(true);
            break;
        }
      }
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setShowKeyboardShortcuts(false);
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [sidebarCollapsed, navigate]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const navigationItems = [
    { 
      name: 'Dashboard', 
      icon: Layers, 
      path: '/admin',
      description: 'Overview and analytics'
    },
    { 
      name: 'Orders', 
      icon: Package, 
      path: '/admin/orders',
      description: 'Manage customer orders'
    },
    { 
      name: 'Products', 
      icon: ShoppingBag, 
      path: '/admin/products',
      description: 'Product catalog management'
    },
    { 
      name: 'Customers', 
      icon: Users, 
      path: '/admin/customers',
      description: 'Customer database'
    },
    { 
      name: 'Analytics', 
      icon: BarChart3, 
      path: '/admin/analytics',
      description: 'Sales and performance data'
    },
    { 
      name: 'Settings', 
      icon: Settings, 
      path: '/admin/settings',
      description: 'System configuration'
    }
  ];

  const quickActions = [
    { name: 'Add Product', action: () => navigate('/admin/products'), icon: ShoppingBag },
    { name: 'View Orders', action: () => navigate('/admin/orders'), icon: Package },
    { name: 'Customer Support', action: () => navigate('/admin/customers'), icon: Users }
  ];

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Admin', path: '/admin' }];
    
    if (pathSegments.length > 1) {
      const currentPage = pathSegments[1];
      const navItem = navigationItems.find(item => item.path.includes(currentPage));
      if (navItem) {
        breadcrumbs.push({ name: navItem.name, path: navItem.path });
      }
    }
    
    return breadcrumbs;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'inventory':
        return <ShoppingBag className="h-4 w-4 text-orange-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationPriorityColor = (priority: string, unread: boolean) => {
    if (!unread) return 'border-l-gray-300';
    
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
      case 'low':
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
      default:
        return 'border-l-gray-300';
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read and navigate based on type
    if (notification.type === 'order') {
      navigate('/admin/orders');
    } else if (notification.type === 'inventory') {
      navigate('/admin/products');
    }
    setNotificationDropdownOpen(false);
  };

  const markAllAsRead = () => {
    // In a real implementation, this would update the state/database
    console.log('Marking all notifications as read');
  };

  const unreadCount = notifications.filter(n => n.unread).length;

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
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700 hidden lg:flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed && (
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">Admin</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        
        {/* Quick Actions */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={action.action}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <action.icon size={16} />
                  <span>{action.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                title={sidebarCollapsed ? item.name : ''}
              >
                <Icon className={`flex-shrink-0 w-5 h-5 ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                {!sidebarCollapsed && (
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl">
            {/* Mobile menu content - similar to desktop sidebar */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">Admin Panel</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <nav className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg ${
                      isActive 
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="mr-3 w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Breadcrumbs */}
              <nav className="hidden md:flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  {getBreadcrumbs().map((item, index) => (
                    <li key={item.path} className="flex items-center">
                      {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
                      <Link
                        to={item.path}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="admin-search"
                  type="text"
                  placeholder="Search... (Ctrl+/)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              {/* Enhanced Notifications */}
              <div className="relative notification-dropdown">
                <button 
                  onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 relative rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs px-2 py-1 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`px-4 py-3 border-l-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${getNotificationPriorityColor(notification.priority, notification.unread)}`}
                          >
                            <div className="flex items-start space-x-3">
                              {/* Order/Type Icon */}
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className={`text-sm ${notification.unread ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                    {notification.message}
                                  </p>
                                  {notification.unread && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                                  )}
                                </div>
                                {notification.details && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {notification.details}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                        <Link
                          to="/admin/orders"
                          onClick={() => setNotificationDropdownOpen(false)}
                          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                        >
                          View all orders →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Help */}
              <button
                onClick={() => setShowKeyboardShortcuts(true)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Keyboard shortcuts (Ctrl+?)"
              >
                <HelpCircle className="w-5 h-5" />
              </button>

              {/* Back to Store */}
              <Link
                to="/"
                className="hidden md:inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Store
              </Link>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowKeyboardShortcuts(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
                <button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Toggle sidebar</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+B</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Search</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+/</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Go to dashboard</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+H</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Show shortcuts</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+?</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Close modal</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;