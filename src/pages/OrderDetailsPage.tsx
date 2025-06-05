import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Truck, Calendar, CreditCard, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRegion } from '../context/RegionContext';
import BreadcrumbNav from '../components/shared/BreadcrumbNav';
import { Order } from '../types/product';
import { useLanguage } from '../context/LanguageContext';

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { formatPrice } = useRegion();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusTimeline = (status: string) => {
    const steps = [
      { name: 'Order Placed', icon: Package },
      { name: 'Confirmed', icon: CreditCard },
      { name: 'Shipped', icon: Truck },
      { name: 'Delivered', icon: MapPin }
    ];

    const statusIndex = ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(status);

    return steps.map((step, index) => {
      const StepIcon = step.icon;
      const isCompleted = index <= statusIndex;
      const isCurrent = index === statusIndex;

      return {
        ...step,
        isCompleted,
        isCurrent
      };
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md">
          {error || 'Order not found'}
        </div>
        <Link
          to="/profile/orders"
          className="mt-4 inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const timeline = getStatusTimeline(order.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbNav 
        items={[
          { name: 'Home', href: '/' },
          { name: 'Profile', href: '/profile' },
          { name: 'Orders', href: '/profile/orders' },
          { name: `Order #${order.id.slice(0, 8)}` }
        ]} 
      />

      <div className="mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {/* Order Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold dark:text-white">Order #{order.id.slice(0, 8)}</h1>
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="mr-1.5 h-4 w-4" />
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </div>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {timeline.map((step, index) => (
                <div key={step.name} className="relative flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.isCompleted
                        ? 'bg-primary-600 dark:bg-primary-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <step.icon
                      className={`w-5 h-5 ${
                        step.isCompleted ? 'text-white' : 'text-gray-400 dark:text-gray-500'
                      }`}
                    />
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    {step.name}
                  </div>
                  {index < timeline.length - 1 && (
                    <div
                      className={`absolute top-4 left-full w-full h-0.5 -ml-4 ${
                        step.isCompleted 
                          ? 'bg-primary-600 dark:bg-primary-500' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium mb-4 dark:text-white">Order Items</h2>
            <div className="flow-root">
              <ul className="-my-6 divide-y divide-gray-200 dark:divide-gray-700">
                {order.items.map((item, index) => (
                  <li key={index} className="py-6 flex">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </h4>
                          <div className="mt-1 flex text-sm text-gray-500 dark:text-gray-400">
                            <p>Quantity: {item.quantity}</p>
                            {item.discount > 0 && (
                              <p className="ml-4">Discount: {item.discount}%</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          {item.discount > 0 && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-through">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium mb-4 dark:text-white">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="dark:text-white">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="dark:text-white">{formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="dark:text-white">{formatPrice(order.tax)}</span>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-lg font-bold">
                  <span className="dark:text-white">Total</span>
                  <span className="dark:text-white">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium mb-4 dark:text-white">Shipping Information</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.shipping_address.fullName}
                </p>
                <p>{order.shipping_address.addressLine1}</p>
                {order.shipping_address.addressLine2 && (
                  <p>{order.shipping_address.addressLine2}</p>
                )}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state}{' '}
                  {order.shipping_address.pincode}
                </p>
                <p className="mt-2">Phone: {order.shipping_address.phone}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4 dark:text-white">Payment Information</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Payment Method: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}</p>
                <p className="mt-2">Payment Status: {order.status === 'pending' ? 'Pending' : 'Completed'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between items-center">
          <Link
            to="/profile/orders"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            ← Back to Orders
          </Link>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
            onClick={() => window.print()}
          >
            Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;