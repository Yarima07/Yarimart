import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import { useLanguage } from '../context/LanguageContext';
import BreadcrumbNav from '../components/shared/BreadcrumbNav';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useRegion();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const price = item.discount > 0 
      ? item.price * (1 - item.discount / 100) 
      : item.price;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 5000 ? 0 : 100;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/auth');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav 
        items={[
          { name: 'Home', href: '/' },
          { name: t('cart.title') }
        ]} 
      />

      <h1 className="text-2xl md:text-3xl font-bold mt-8 mb-8 dark:text-white">{t('cart.title')}</h1>

      {cart.length === 0 ? (
        <div className="text-center py-16 space-y-6">
          <div className="flex justify-center">
            <ShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
          <p className="text-xl text-gray-500 dark:text-gray-400">{t('cart.empty')}</p>
          <p className="text-gray-500 dark:text-gray-400">{t('cart.emptyMessage')}</p>
          <Link
            to="/catalog"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            {t('cart.startShopping')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {cart.map((item) => {
                  const finalPrice = item.discount > 0 
                    ? item.price * (1 - item.discount / 100) 
                    : item.price;
                    
                  return (
                    <li key={item.id} className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        {/* Product image */}
                        <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md">
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>

                        {/* Product details */}
                        <div className="sm:ml-6 sm:flex-1 mt-4 sm:mt-0">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                <Link to={`/product/${item.id}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                                  {item.name}
                                </Link>
                              </h3>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatPrice(finalPrice)}
                              {item.discount > 0 && (
                                <span className="ml-2 text-gray-500 dark:text-gray-400 line-through text-xs">
                                  {formatPrice(item.price)}
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                -
                              </button>
                              <span className="px-3 py-1 text-gray-800 dark:text-gray-200">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-500 dark:text-gray-400 hover:text-accent-500 dark:hover:text-accent-400 transition"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <Link
                to="/catalog"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition flex items-center"
              >
                <ArrowRight className="h-4 w-4 mr-1 transform rotate-180" />
                {t('cart.continueShopping')}
              </Link>
              <button
                onClick={clearCart}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
              >
                {t('cart.clearCart')}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium dark:text-white">{t('cart.orderSummary')}</h2>
              
              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <p className="text-gray-600 dark:text-gray-400">{t('cart.subtotal')}</p>
                  <p className="text-gray-900 dark:text-white font-medium">{formatPrice(subtotal)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600 dark:text-gray-400">{t('cart.shipping')}</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600 dark:text-gray-400">{t('cart.tax')}</p>
                  <p className="text-gray-900 dark:text-white font-medium">{formatPrice(tax)}</p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 flex justify-between">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{t('cart.total')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(total)}</p>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-md font-medium dark:bg-primary-700 dark:hover:bg-primary-600 transition"
                >
                  {t('cart.checkout')}
                </button>
              </div>

              <div className="mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {t('cart.freeShipping')}
                </p>
              </div>
              
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center">
                  <img 
                    src="https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg" 
                    alt="Payment Options" 
                    className="h-6 w-auto"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    Secure payment options available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;