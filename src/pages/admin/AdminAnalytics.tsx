import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, Package, 
  Users, ShoppingBag, Calendar, Download, RefreshCw,
  ArrowUpRight, ArrowDownRight, Eye, PieChart, Activity
} from 'lucide-react';

interface AnalyticsData {
  salesOverTime: { month: string; revenue: number; orders: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
  customerMetrics: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    customerGrowth: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    averageOrderValue: number;
  };
  categoryPerformance: { category: string; sales: number; percentage: number }[];
}

const AdminAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch orders and products data
      const [ordersResult, productsResult] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('products').select('*')
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (productsResult.error) throw productsResult.error;

      const orders = ordersResult.data || [];
      const products = productsResult.data || [];

      // Calculate real analytics data
      const salesOverTime = calculateSalesOverTime(orders);
      const topProducts = calculateTopProducts(orders, products);
      const customerMetrics = calculateCustomerMetrics(orders);
      const revenueMetrics = calculateRevenueMetrics(orders);
      const categoryPerformance = calculateCategoryPerformance(orders, products);

      setAnalyticsData({
        salesOverTime,
        topProducts,
        customerMetrics,
        revenueMetrics,
        categoryPerformance
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSalesOverTime = (orders: any[]) => {
    // Get the last 6 months of data
    const monthsData: { [key: string]: { revenue: number; orders: number } } = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleString('en-US', { month: 'short' });
      monthsData[monthKey] = { revenue: 0, orders: 0 };
    }

    // Process actual orders
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const monthKey = orderDate.toLocaleString('en-US', { month: 'short' });
      
      if (monthsData[monthKey]) {
        monthsData[monthKey].revenue += parseFloat(order.total || 0);
        monthsData[monthKey].orders += 1;
      }
    });

    return Object.entries(monthsData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orders: data.orders
    }));
  };

  const calculateTopProducts = (orders: any[], products: any[]) => {
    const productSales: { [productId: string]: { sales: number; revenue: number; name: string } } = {};

    // Initialize product sales tracking
    products.forEach(product => {
      productSales[product.id] = {
        sales: 0,
        revenue: 0,
        name: product.name
      };
    });

    // Process orders to calculate product sales
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          if (item.product_id && productSales[item.product_id]) {
            productSales[item.product_id].sales += item.quantity || 0;
            productSales[item.product_id].revenue += (item.price || 0) * (item.quantity || 0);
          }
        });
      }
    });

    // Sort by sales and return top 5
    return Object.values(productSales)
      .filter(product => product.sales > 0)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map(product => ({
        name: product.name,
        sales: product.sales,
        revenue: product.revenue
      }));
  };

  const calculateCustomerMetrics = (orders: any[]) => {
    const uniqueCustomers = new Set(orders.map(order => order.user_id)).size;
    
    // Calculate new vs returning customers based on order history
    const customerOrderCounts: { [customerId: string]: number } = {};
    orders.forEach(order => {
      if (order.user_id) {
        customerOrderCounts[order.user_id] = (customerOrderCounts[order.user_id] || 0) + 1;
      }
    });

    const newCustomers = Object.values(customerOrderCounts).filter(count => count === 1).length;
    const returningCustomers = uniqueCustomers - newCustomers;

    // Calculate growth based on recent orders (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentCustomers = new Set(
      orders
        .filter(order => new Date(order.created_at) >= thirtyDaysAgo)
        .map(order => order.user_id)
    ).size;

    const previousCustomers = new Set(
      orders
        .filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
        })
        .map(order => order.user_id)
    ).size;

    const customerGrowth = previousCustomers > 0 
      ? ((recentCustomers - previousCustomers) / previousCustomers) * 100 
      : 0;

    return {
      totalCustomers: uniqueCustomers,
      newCustomers,
      returningCustomers,
      customerGrowth
    };
  };

  const calculateRevenueMetrics = (orders: any[]) => {
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    
    // Calculate monthly revenue (average per month based on order data)
    const monthlyRevenue = orders.length > 0 ? totalRevenue / 6 : 0; // Assuming 6 months of data
    
    // Calculate revenue growth (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentRevenue = orders
      .filter(order => new Date(order.created_at) >= thirtyDaysAgo)
      .reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

    const previousRevenue = orders
      .filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
      })
      .reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

    const revenueGrowth = previousRevenue > 0 
      ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      totalRevenue,
      monthlyRevenue,
      revenueGrowth,
      averageOrderValue
    };
  };

  const calculateCategoryPerformance = (orders: any[], products: any[]) => {
    const categorySales: { [category: string]: number } = {};

    // Initialize categories
    const categories = [...new Set(products.map(p => p.category))];
    categories.forEach(category => {
      categorySales[category] = 0;
    });

    // Calculate sales per category
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          // Find the product to get its category
          const product = products.find(p => p.id === item.product_id);
          if (product && product.category) {
            categorySales[product.category] += item.quantity || 0;
          }
        });
      }
    });

    const totalSales = Object.values(categorySales).reduce((sum, sales) => sum + sales, 0);

    return Object.entries(categorySales)
      .map(([category, sales]) => ({
        category,
        sales,
        percentage: totalSales > 0 ? (sales / totalSales) * 100 : 0
      }))
      .sort((a, b) => b.sales - a.sales);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const exportReport = () => {
    if (!analyticsData) return;
    
    const reportData = {
      ...analyticsData,
      generatedAt: new Date().toISOString(),
      dateRange
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Analytics Data</h3>
        <p className="text-gray-500 dark:text-gray-400">Unable to load analytics data at this time.</p>
        <button
          onClick={fetchAnalyticsData}
          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Insights into your business performance and customer behavior
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="12months">Last 12 months</option>
          </select>
          <button
            onClick={exportReport}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={fetchAnalyticsData}
            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(analyticsData.revenueMetrics.totalRevenue)}
              </p>
              <div className={`flex items-center mt-2 text-sm ${
                analyticsData.revenueMetrics.revenueGrowth >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {analyticsData.revenueMetrics.revenueGrowth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="ml-1">{Math.abs(analyticsData.revenueMetrics.revenueGrowth).toFixed(1)}%</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-green-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(analyticsData.revenueMetrics.averageOrderValue)}
              </p>
              <div className="flex items-center mt-2 text-sm text-blue-600 dark:text-blue-400">
                <BarChart3 size={16} />
                <span className="ml-1">AOV</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-blue-500">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {analyticsData.customerMetrics.totalCustomers}
              </p>
              <div className={`flex items-center mt-2 text-sm ${
                analyticsData.customerMetrics.customerGrowth >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {analyticsData.customerMetrics.customerGrowth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="ml-1">{Math.abs(analyticsData.customerMetrics.customerGrowth).toFixed(1)}%</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-purple-500">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(analyticsData.revenueMetrics.monthlyRevenue)}
              </p>
              <div className="flex items-center mt-2 text-sm text-orange-600 dark:text-orange-400">
                <Activity size={16} />
                <span className="ml-1">Avg/Month</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-orange-500">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Over Time Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Over Time</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedMetric('revenue')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedMetric === 'revenue'
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setSelectedMetric('orders')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedMetric === 'orders'
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Orders
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.salesOverTime.map((data, index) => {
                const maxValue = selectedMetric === 'revenue' 
                  ? Math.max(...analyticsData.salesOverTime.map(d => d.revenue))
                  : Math.max(...analyticsData.salesOverTime.map(d => d.orders));
                
                const percentage = maxValue > 0 
                  ? (selectedMetric === 'revenue' ? data.revenue : data.orders) / maxValue * 100
                  : 0;

                return (
                  <div key={data.month} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 text-sm text-gray-600 dark:text-gray-400">{data.month}</div>
                      <div className="flex-1">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                      {selectedMetric === 'revenue'
                        ? formatCurrency(data.revenue)
                        : `${data.orders} orders`
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Products</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.topProducts.length > 0 ? (
                analyticsData.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {product.name.length > 30 ? `${product.name.substring(0, 30)}...` : product.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{product.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No sales data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance & Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Category Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.categoryPerformance.length > 0 ? (
                analyticsData.categoryPerformance.map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-24 text-sm text-gray-600 dark:text-gray-400">{category.category}</div>
                      <div className="flex-1">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(category.percentage, 5)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                      {category.sales}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No category data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Insights</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analyticsData.customerMetrics.newCustomers}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">New Customers</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analyticsData.customerMetrics.returningCustomers}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Returning</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Customer Retention</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {analyticsData.customerMetrics.totalCustomers > 0 
                    ? Math.round((analyticsData.customerMetrics.returningCustomers / analyticsData.customerMetrics.totalCustomers) * 100)
                    : 0}%
                </span>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: analyticsData.customerMetrics.totalCustomers > 0 
                      ? `${(analyticsData.customerMetrics.returningCustomers / analyticsData.customerMetrics.totalCustomers) * 100}%`
                      : '0%'
                  }} 
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {analyticsData.customerMetrics.customerGrowth.toFixed(1)}%
                </span>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    analyticsData.customerMetrics.customerGrowth >= 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${Math.min(Math.abs(analyticsData.customerMetrics.customerGrowth), 100)}%`
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              analyticsData.revenueMetrics.revenueGrowth >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {analyticsData.revenueMetrics.revenueGrowth >= 0 ? '+' : ''}
              {analyticsData.revenueMetrics.revenueGrowth.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Revenue Growth</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">vs. previous period</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {analyticsData.salesOverTime.reduce((sum, month) => sum + month.orders, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Orders</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">last 6 months</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              analyticsData.customerMetrics.customerGrowth >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {analyticsData.customerMetrics.customerGrowth >= 0 ? '+' : ''}
              {analyticsData.customerMetrics.customerGrowth.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Customer Growth</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">vs. previous period</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;