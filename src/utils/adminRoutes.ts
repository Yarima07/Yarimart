import { lazy } from 'react';

// Dynamic imports for admin components with error handling
export const loadAdminComponent = async (componentName: string) => {
  try {
    switch (componentName) {
      case 'AdminLayout':
        return await import('../pages/admin/AdminLayout');
      case 'AdminDashboard':
        return await import('../pages/admin/AdminDashboard');
      case 'AdminOrders':
        return await import('../pages/admin/AdminOrders');
      case 'AdminProducts':
        return await import('../pages/admin/AdminProducts');
      case 'AdminCustomers':
        return await import('../pages/admin/AdminCustomers');
      case 'AdminAnalytics':
        return await import('../pages/admin/AdminAnalytics');
      case 'AdminSettings':
        return await import('../pages/admin/AdminSettings');
      case 'AdminSecurityLogs':
        return await import('../pages/admin/AdminSecurityLogs');
      default:
        throw new Error(`Unknown admin component: ${componentName}`);
    }
  } catch (error) {
    console.error(`Failed to load admin component ${componentName}:`, error);
    // Return a fallback component
    return {
      default: () => (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Component Unavailable
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Failed to load {componentName}. Please refresh the page or contact support.
          </p>
        </div>
      )
    };
  }
};

// Lazy-loaded admin components with proper error boundaries
export const AdminLayout = lazy(() => loadAdminComponent('AdminLayout'));
export const AdminDashboard = lazy(() => loadAdminComponent('AdminDashboard'));
export const AdminOrders = lazy(() => loadAdminComponent('AdminOrders'));
export const AdminProducts = lazy(() => loadAdminComponent('AdminProducts'));
export const AdminCustomers = lazy(() => loadAdminComponent('AdminCustomers'));
export const AdminAnalytics = lazy(() => loadAdminComponent('AdminAnalytics'));
export const AdminSettings = lazy(() => loadAdminComponent('AdminSettings'));
export const AdminSecurityLogs = lazy(() => loadAdminComponent('AdminSecurityLogs'));

// Admin route configuration
export const adminRoutes = [
  {
    path: '',
    component: 'AdminDashboard',
    title: 'Dashboard',
    description: 'Overview and analytics'
  },
  {
    path: 'orders',
    component: 'AdminOrders',
    title: 'Orders',
    description: 'Manage customer orders'
  },
  {
    path: 'products',
    component: 'AdminProducts',
    title: 'Products',
    description: 'Product catalog management'
  },
  {
    path: 'customers',
    component: 'AdminCustomers',
    title: 'Customers',
    description: 'Customer database'
  },
  {
    path: 'analytics',
    component: 'AdminAnalytics',
    title: 'Analytics',
    description: 'Sales and performance data'
  },
  {
    path: 'security',
    component: 'AdminSecurityLogs',
    title: 'Security Logs',
    description: 'Monitor access and security events'
  },
  {
    path: 'settings',
    component: 'AdminSettings',
    title: 'Settings',
    description: 'System configuration'
  }
];

export const getAdminRoute = (path: string) => {
  return adminRoutes.find(route => route.path === path);
};

export const isValidAdminRoute = (path: string): boolean => {
  return adminRoutes.some(route => route.path === path);
};