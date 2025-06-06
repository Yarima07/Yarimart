import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  FileText, Download, Calendar, Filter, TrendingUp, TrendingDown,
  DollarSign, Package, Users, ShoppingBag, AlertCircle, CheckCircle,
  Clock, Truck, Eye, RefreshCw, FileDown, BarChart3, PieChart
} from 'lucide-react';

interface ReportData {
  salesReport: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    topSellingProducts: Array<{
      name: string;
      sales: number;
      revenue: number;
    }>;
    salesByCategory: Array<{
      category: string;
      sales: number;
      revenue: number;
    }>;
    dailySales: Array<{
      date: string;
      sales: number;
      orders: number;
    }>;
  };
  inventoryReport: {
    totalProducts: number;
    lowStockProducts: Array<{
      name: string;
      stock: number;
      category: string;
    }>;
    outOfStockProducts: Array<{
      name: string;
      category: string;
    }>;
    categoryInventory: Array<{
      category: string;
      totalProducts: number;
      totalStock: number;
      averageStock: number;
    }>;
  };
  customerReport: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    topCustomers: Array<{
      email: string;
      orders: number;
      totalSpent: number;
    }>;
    customersByLocation: Array<{
      state: string;
      customers: number;
    }>;
  };
  orderReport: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    ordersByStatus: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    ordersByPaymentMethod: Array<{
      method: string;
      count: number;
      percentage: number;
    }>;
  };
}

const AdminReports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateRange, setDateRange] = useState('30days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCustomDateRange, setIsCustomDateRange] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, startDate, endDate]);

  const getDateFilter = () => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (isCustomDateRange && startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (dateRange) {
        case '7days':
          start.setDate(now.getDate() - 7);
          break;
        case '30days':
          start.setDate(now.getDate() - 30);
          break;
        case '90days':
          start.setDate(now.getDate() - 90);
          break;
        case '12months':
          start.setFullYear(now.getFullYear() - 1);
          break;
        default:
          start.setDate(now.getDate() - 30);
      }
    }

    return { start, end };
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateFilter();
      
      // Fetch all necessary data
      const [ordersResult, productsResult] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('products').select('*')
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (productsResult.error) throw productsResult.error;

      const allOrders = ordersResult.data || [];
      const allProducts = productsResult.data || [];

      // Filter orders by date range
      const filteredOrders = allOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= start && orderDate <= end;
      });

      // Generate comprehensive report data
      const salesReport = generateSalesReport(filteredOrders, allProducts);
      const inventoryReport = generateInventoryReport(allProducts, filteredOrders);
      const customerReport = await generateCustomerReport(filteredOrders);
      const orderReport = generateOrderReport(filteredOrders);

      setReportData({
        salesReport,
        inventoryReport,
        customerReport,
        orderReport
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSalesReport = (orders: any[], products: any[]) => {
    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Top selling products
    const productSales: { [id: string]: { name: string; sales: number; revenue: number } } = {};
    
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const product = products.find(p => p.id === item.product_id);
          if (product) {
            if (!productSales[product.id]) {
              productSales[product.id] = { name: product.name, sales: 0, revenue: 0 };
            }
            productSales[product.id].sales += item.quantity || 0;
            productSales[product.id].revenue += (item.price || 0) * (item.quantity || 0);
          }
        });
      }
    });

    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Sales by category
    const categorySales: { [category: string]: { sales: number; revenue: number } } = {};
    
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const product = products.find(p => p.id === item.product_id);
          if (product) {
            if (!categorySales[product.category]) {
              categorySales[product.category] = { sales: 0, revenue: 0 };
            }
            categorySales[product.category].sales += item.quantity || 0;
            categorySales[product.category].revenue += (item.price || 0) * (item.quantity || 0);
          }
        });
      }
    });

    const salesByCategory = Object.entries(categorySales)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    // Daily sales for the last 7 days
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(order => 
        order.created_at.startsWith(dateStr)
      );
      
      dailySales.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: dayOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0),
        orders: dayOrders.length
      });
    }

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      topSellingProducts,
      salesByCategory,
      dailySales
    };
  };

  const generateInventoryReport = (products: any[], orders: any[]) => {
    const totalProducts = products.length;
    const lowStockProducts = products
      .filter(product => product.stock <= 10 && product.stock > 0)
      .map(product => ({
        name: product.name,
        stock: product.stock,
        category: product.category
      }))
      .sort((a, b) => a.stock - b.stock);

    const outOfStockProducts = products
      .filter(product => product.stock === 0)
      .map(product => ({
        name: product.name,
        category: product.category
      }));

    // Category inventory analysis
    const categoryInventory: { [category: string]: { products: number; totalStock: number } } = {};
    
    products.forEach(product => {
      if (!categoryInventory[product.category]) {
        categoryInventory[product.category] = { products: 0, totalStock: 0 };
      }
      categoryInventory[product.category].products += 1;
      categoryInventory[product.category].totalStock += product.stock || 0;
    });

    const categoryInventoryReport = Object.entries(categoryInventory)
      .map(([category, data]) => ({
        category,
        totalProducts: data.products,
        totalStock: data.totalStock,
        averageStock: data.products > 0 ? Math.round(data.totalStock / data.products) : 0
      }))
      .sort((a, b) => b.totalStock - a.totalStock);

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      categoryInventory: categoryInventoryReport
    };
  };

  const generateCustomerReport = async (orders: any[]) => {
    // Get unique customers from orders
    const customerData: { [userId: string]: { orders: number; totalSpent: number; email?: string } } = {};
    
    orders.forEach(order => {
      if (order.user_id) {
        if (!customerData[order.user_id]) {
          customerData[order.user_id] = { orders: 0, totalSpent: 0 };
        }
        customerData[order.user_id].orders += 1;
        customerData[order.user_id].totalSpent += parseFloat(order.total || 0);
      }
    });

    // Try to fetch customer emails
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`;
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const users = await response.json();
          users.forEach((user: any) => {
            if (customerData[user.id]) {
              customerData[user.id].email = user.email;
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching customer emails:', error);
    }

    const totalCustomers = Object.keys(customerData).length;
    const newCustomers = Object.values(customerData).filter(customer => customer.orders === 1).length;
    const returningCustomers = totalCustomers - newCustomers;

    const topCustomers = Object.entries(customerData)
      .map(([userId, data]) => ({
        email: data.email || `Customer ${userId.slice(0, 8)}`,
        orders: data.orders,
        totalSpent: data.totalSpent
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Customer distribution by state (from shipping addresses)
    const locationData: { [state: string]: number } = {};
    orders.forEach(order => {
      if (order.shipping_address && order.shipping_address.state) {
        const state = order.shipping_address.state;
        locationData[state] = (locationData[state] || 0) + 1;
      }
    });

    const customersByLocation = Object.entries(locationData)
      .map(([state, customers]) => ({ state, customers }))
      .sort((a, b) => b.customers - a.customers)
      .slice(0, 10);

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
      topCustomers,
      customersByLocation
    };
  };

  const generateOrderReport = (orders: any[]) => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

    // Orders by status
    const statusCounts: { [status: string]: number } = {};
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    const ordersByStatus = Object.entries(statusCounts)
      .map(([status, count]) => ({
        status,
        count,
        percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Orders by payment method
    const paymentCounts: { [method: string]: number } = {};
    orders.forEach(order => {
      const method = order.payment_method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer';
      paymentCounts[method] = (paymentCounts[method] || 0) + 1;
    });

    const ordersByPaymentMethod = Object.entries(paymentCounts)
      .map(([method, count]) => ({
        method,
        count,
        percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      ordersByStatus,
      ordersByPaymentMethod
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const exportReport = (type: 'csv' | 'json') => {
    if (!reportData) return;

    let content = '';
    let filename = '';

    if (type === 'csv') {
      // Generate CSV content based on selected report
      switch (selectedReport) {
        case 'sales':
          content = generateSalesCSV(reportData.salesReport);
          filename = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'inventory':
          content = generateInventoryCSV(reportData.inventoryReport);
          filename = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'customers':
          content = generateCustomerCSV(reportData.customerReport);
          filename = `customer-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'orders':
          content = generateOrderCSV(reportData.orderReport);
          filename = `order-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
      }
    } else {
      // JSON export
      content = JSON.stringify(reportData, null, 2);
      filename = `full-report-${new Date().toISOString().split('T')[0]}.json`;
    }

    const blob = new Blob([content], { type: type === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateSalesCSV = (salesData: any) => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Sales', formatCurrency(salesData.totalSales)],
      ['Total Orders', salesData.totalOrders.toString()],
      ['Average Order Value', formatCurrency(salesData.averageOrderValue)],
      ['', ''],
      ['Top Products', ''],
      ['Product Name', 'Sales Quantity', 'Revenue'],
      ...salesData.topSellingProducts.map((product: any) => [
        product.name,
        product.sales.toString(),
        formatCurrency(product.revenue)
      ])
    ];
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateInventoryCSV = (inventoryData: any) => {
    const headers = ['Product Name', 'Stock', 'Category', 'Status'];
    const rows = [
      ...inventoryData.lowStockProducts.map((product: any) => [
        product.name,
        product.stock.toString(),
        product.category,
        'Low Stock'
      ]),
      ...inventoryData.outOfStockProducts.map((product: any) => [
        product.name,
        '0',
        product.category,
        'Out of Stock'
      ])
    ];
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateCustomerCSV = (customerData: any) => {
    const headers = ['Customer Email', 'Total Orders', 'Total Spent'];
    const rows = customerData.topCustomers.map((customer: any) => [
      customer.email,
      customer.orders.toString(),
      formatCurrency(customer.totalSpent)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateOrderCSV = (orderData: any) => {
    const headers = ['Status', 'Count', 'Percentage'];
    const rows = orderData.ordersByStatus.map((status: any) => [
      status.status,
      status.count.toString(),
      `${status.percentage.toFixed(1)}%`
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', icon: DollarSign, color: 'bg-green-500' },
    { id: 'inventory', name: 'Inventory Report', icon: Package, color: 'bg-blue-500' },
    { id: 'customers', name: 'Customer Report', icon: Users, color: 'bg-purple-500' },
    { id: 'orders', name: 'Order Report', icon: ShoppingBag, color: 'bg-orange-500' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive business reports and data analysis
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="custom-range"
              checked={isCustomDateRange}
              onChange={(e) => setIsCustomDateRange(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="custom-range" className="text-sm text-gray-700 dark:text-gray-300">
              Custom range
            </label>
          </div>
          
          {isCustomDateRange ? (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          ) : (
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
          )}
          
          <button
            onClick={() => exportReport('csv')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => exportReport('json')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </button>
          <button
            onClick={fetchReportData}
            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedReport === type.id;
          
          return (
            <button
              key={type.id}
              onClick={() => setSelectedReport(type.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{type.name}</div>
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      {reportData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {selectedReport === 'sales' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Sales Report</h3>
              
              {/* Sales Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400">Total Sales</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(reportData.salesReport.totalSales)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ShoppingBag className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Total Orders</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {reportData.salesReport.totalOrders}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Avg Order Value</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {formatCurrency(reportData.salesReport.averageOrderValue)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Sales Chart */}
              <div className="mb-8">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Daily Sales (Last 7 Days)</h4>
                <div className="space-y-3">
                  {reportData.salesReport.dailySales.map((day, index) => {
                    const maxSales = Math.max(...reportData.salesReport.dailySales.map(d => d.sales));
                    const percentage = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 w-1/4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{day.date}</span>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(percentage, 5)}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right w-1/4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(day.sales)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {day.orders} orders
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Products and Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Top Selling Products</h4>
                  <div className="space-y-3">
                    {reportData.salesReport.topSellingProducts.length > 0 ? (
                      reportData.salesReport.topSellingProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {product.name.length > 30 ? `${product.name.substring(0, 30)}...` : product.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{product.sales} units sold</p>
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

                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Sales by Category</h4>
                  <div className="space-y-3">
                    {reportData.salesReport.salesByCategory.length > 0 ? (
                      reportData.salesReport.salesByCategory.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{category.category}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{category.sales} units</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(category.revenue)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">No category data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'inventory' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Inventory Report</h3>
              
              {/* Inventory Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Total Products</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {reportData.inventoryReport.totalProducts}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mr-3" />
                    <div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Low Stock Items</p>
                      <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                        {reportData.inventoryReport.lowStockProducts.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mr-3" />
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400">Out of Stock</p>
                      <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                        {reportData.inventoryReport.outOfStockProducts.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Products */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Low Stock Alert</h4>
                  <div className="space-y-3">
                    {reportData.inventoryReport.lowStockProducts.length > 0 ? (
                      reportData.inventoryReport.lowStockProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {product.name.length > 25 ? `${product.name.substring(0, 25)}...` : product.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-yellow-700 dark:text-yellow-300">
                              {product.stock} left
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">No low stock items</p>
                    )}
                  </div>
                </div>

                {/* Category Inventory */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Inventory by Category</h4>
                  <div className="space-y-3">
                    {reportData.inventoryReport.categoryInventory.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{category.category}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {category.totalProducts} products
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {category.totalStock} total
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {category.averageStock} avg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Out of Stock Products */}
              {reportData.inventoryReport.outOfStockProducts.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Out of Stock Products</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {reportData.inventoryReport.outOfStockProducts.map((product, index) => (
                      <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {product.name.length > 20 ? `${product.name.substring(0, 20)}...` : product.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedReport === 'customers' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Customer Report</h3>
              
              {/* Customer Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Total Customers</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {reportData.customerReport.totalCustomers}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400">New Customers</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {reportData.customerReport.newCustomers}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Returning</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {reportData.customerReport.returningCustomers}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Customers */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Top Customers</h4>
                  <div className="space-y-3">
                    {reportData.customerReport.topCustomers.length > 0 ? (
                      reportData.customerReport.topCustomers.map((customer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {customer.email.length > 25 ? `${customer.email.substring(0, 25)}...` : customer.email}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{customer.orders} orders</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(customer.totalSpent)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">No customer data available</p>
                    )}
                  </div>
                </div>

                {/* Customers by Location */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Customers by State</h4>
                  <div className="space-y-3">
                    {reportData.customerReport.customersByLocation.length > 0 ? (
                      reportData.customerReport.customersByLocation.map((location, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{location.state}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {location.customers} customers
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">No location data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'orders' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Report</h3>
              
              {/* Order Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ShoppingBag className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Total Orders</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {reportData.orderReport.totalOrders}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mr-3" />
                    <div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
                      <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                        {reportData.orderReport.pendingOrders}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400">Completed</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {reportData.orderReport.completedOrders}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mr-3" />
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400">Cancelled</p>
                      <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                        {reportData.orderReport.cancelledOrders}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders by Status */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Orders by Status</h4>
                  <div className="space-y-3">
                    {reportData.orderReport.ordersByStatus.map((status, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-16 text-sm text-gray-600 dark:text-gray-400 capitalize">{status.status}</div>
                          <div className="flex-1">
                            <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(status.percentage, 5)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-medium text-gray-900 dark:text-white">{status.count}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{status.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orders by Payment Method */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Payment Methods</h4>
                  <div className="space-y-3">
                    {reportData.orderReport.ordersByPaymentMethod.map((method, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-20 text-sm text-gray-600 dark:text-gray-400">{method.method}</div>
                          <div className="flex-1">
                            <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(method.percentage, 5)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-medium text-gray-900 dark:text-white">{method.count}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{method.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReports;