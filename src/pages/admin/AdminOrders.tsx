import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, ArrowDown, ArrowUp } from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  items: any[];
  shipping_address: any;
  payment_method: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  created_at: string;
  user?: { email: string } | null;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Order>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, sortField, sortDirection]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*, user:user_id(email)');
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      let { data, error } = await query.order(sortField, { ascending: sortDirection === 'asc' });
      
      if (error) throw error;
      setOrders(data as Order[] || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Order) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered') => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Close modal if open
      if (isModalOpen) {
        setIsModalOpen(false);
        setSelectedOrder(null);
      }
      
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    // Check if any part of the order matches the search query
    const searchString = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchString) ||
      order.user?.email?.toLowerCase().includes(searchString) ||
      order.shipping_address.fullName.toLowerCase().includes(searchString) ||
      order.status.toLowerCase().includes(searchString)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    Order ID
                    {sortField === 'id' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center">
                    Date
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center">
                    Total
                    {sortField === 'total' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="animate-pulse flex justify-center">
                      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.user?.email || order.shipping_address.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' : 
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : 
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100' : 
                              'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Order Details - #{selectedOrder.id.slice(0, 8)}
                    </h3>
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Customer Information</h4>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedOrder.shipping_address.fullName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOrder.user?.email}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOrder.shipping_address.phone}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Shipping Address</h4>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedOrder.shipping_address.addressLine1}</p>
                          {selectedOrder.shipping_address.addressLine2 && (
                            <p className="text-sm text-gray-900 dark:text-white">{selectedOrder.shipping_address.addressLine2}</p>
                          )}
                          <p className="text-sm text-gray-900 dark:text-white">
                            {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.pincode}
                          </p>
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Order Items</h4>
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedOrder.items.map((item, index) => (
                          <li key={index} className="py-3 flex justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Quantity: {item.quantity}</p>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</p>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex justify-between mb-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Subtotal</p>
                          <p className="text-sm text-gray-900 dark:text-white">{formatCurrency(selectedOrder.subtotal)}</p>
                        </div>
                        <div className="flex justify-between mb-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Shipping</p>
                          <p className="text-sm text-gray-900 dark:text-white">{formatCurrency(selectedOrder.shipping)}</p>
                        </div>
                        <div className="flex justify-between mb-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Tax</p>
                          <p className="text-sm text-gray-900 dark:text-white">{formatCurrency(selectedOrder.tax)}</p>
                        </div>
                        <div className="flex justify-between font-medium mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-900 dark:text-white">Total</p>
                          <p className="text-sm text-gray-900 dark:text-white">{formatCurrency(selectedOrder.total)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Order Status</h4>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleStatusChange(selectedOrder.id, 'pending')}
                            disabled={updatingStatus || selectedOrder.status === 'pending'}
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              selectedOrder.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
                            }`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => handleStatusChange(selectedOrder.id, 'confirmed')}
                            disabled={updatingStatus || selectedOrder.status === 'confirmed'}
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              selectedOrder.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                            }`}
                          >
                            Confirmed
                          </button>
                          <button
                            onClick={() => handleStatusChange(selectedOrder.id, 'shipped')}
                            disabled={updatingStatus || selectedOrder.status === 'shipped'}
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              selectedOrder.status === 'shipped'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                            }`}
                          >
                            Shipped
                          </button>
                          <button
                            onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                            disabled={updatingStatus || selectedOrder.status === 'delivered'}
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              selectedOrder.status === 'delivered'
                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30'
                            }`}
                          >
                            Delivered
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                        <p>Order ID: {selectedOrder.id}</p>
                        <p>Payment Method: {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}</p>
                        <p>Order Date: {formatDate(selectedOrder.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;