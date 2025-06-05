import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';

const OrderSuccessPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Order Placed Successfully!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Thank you for your purchase. We'll send you a confirmation email with your order details.
        </p>

        {/* Order Timeline */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200"></div>
          <div className="space-y-8">
            <div className="relative flex items-center justify-center">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="ml-12 text-left">
                <h3 className="font-medium">Order Confirmed</h3>
                <p className="text-sm text-gray-500">Your order has been placed</p>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-500" />
              </div>
              <div className="ml-12 text-left">
                <h3 className="font-medium">Processing</h3>
                <p className="text-sm text-gray-500">We're preparing your order</p>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-gray-500" />
              </div>
              <div className="ml-12 text-left">
                <h3 className="font-medium">Shipping</h3>
                <p className="text-sm text-gray-500">Your order will be shipped soon</p>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Home className="w-5 h-5 text-gray-500" />
              </div>
              <div className="ml-12 text-left">
                <h3 className="font-medium">Delivery</h3>
                <p className="text-sm text-gray-500">Estimated delivery in 3-5 business days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-x-4">
          <Link
            to="/profile/orders"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            View Order
          </Link>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;