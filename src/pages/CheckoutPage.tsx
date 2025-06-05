import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import { useLanguage } from '../context/LanguageContext';
import BreadcrumbNav from '../components/shared/BreadcrumbNav';
import { MapPin, CreditCard, Truck, Shield, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useRegion();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank'>('cod');
  const [address, setAddress] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }

    // Fetch user's saved address
    const fetchUserAddress = async () => {
      const { data: { user: userData }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      if (userData?.user_metadata) {
        const {
          full_name,
          addressLine1,
          addressLine2,
          city,
          state,
          pincode,
          phone
        } = userData.user_metadata;

        setAddress({
          fullName: full_name || '',
          addressLine1: addressLine1 || '',
          addressLine2: addressLine2 || '',
          city: city || '',
          state: state || '',
          pincode: pincode || '',
          phone: phone || ''
        });
      }
    };

    fetchUserAddress();
  }, [user, cart, navigate]);

  const subtotal = cart.reduce((sum, item) => {
    const price = item.discount > 0 
      ? item.price * (1 - item.discount / 100) 
      : item.price;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 5000 ? 0 : 100;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Save address to user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: address.fullName,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          phone: address.phone
        }
      });

      if (updateError) throw updateError;

      // Create order in the database
      const { error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user?.id,
            items: cart.map(item => ({
              product_id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              discount: item.discount
            })),
            shipping_address: address,
            payment_method: paymentMethod,
            status: 'pending',
            subtotal,
            shipping,
            tax,
            total
          }
        ]);

      if (orderError) throw orderError;
      
      clearCart();
      navigate('/order-success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav 
        items={[
          { name: 'Home', href: '/' },
          { name: 'Cart', href: '/cart' },
          { name: t('checkout.title') }
        ]} 
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Checkout Form */}
        <div>
          <h2 className="text-2xl font-bold mb-6 dark:text-white">{t('checkout.shippingInfo')}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={address.fullName}
                onChange={handleAddressChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Address Line 1
              </label>
              <input
                type="text"
                id="addressLine1"
                name="addressLine1"
                value={address.addressLine1}
                onChange={handleAddressChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                id="addressLine2"
                name="addressLine2"
                value={address.addressLine2}
                onChange={handleAddressChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  PIN Code
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={address.pincode}
                  onChange={handleAddressChange}
                  required
                  pattern="[0-9]{6}"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={address.phone}
                  onChange={handleAddressChange}
                  required
                  pattern="[0-9]{10}"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <h3 className="text-lg font-medium mb-4 dark:text-white">{t('checkout.paymentMethod')}</h3>
              <div className="space-y-4">
                <label className="flex items-center p-4 border dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
                  />
                  <div className="ml-3">
                    <span className="font-medium dark:text-white">{t('checkout.cod')}</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('checkout.codDesc')}</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={() => setPaymentMethod('bank')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
                  />
                  <div className="ml-3">
                    <span className="font-medium dark:text-white">{t('checkout.bank')}</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('checkout.bankDesc')}</p>
                  </div>
                </label>
              </div>
            </div>

            {paymentMethod === 'bank' && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2 dark:text-white">{t('checkout.bankDetails')}</h4>
                <div className="text-sm space-y-1 dark:text-gray-300">
                  <p>Account Name: Yarimart Tools Pvt Ltd</p>
                  <p>Account Number: 1234567890</p>
                  <p>IFSC Code: SBIN0123456</p>
                  <p>Bank: State Bank of India</p>
                  <p>Branch: Kochi Main Branch</p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium dark:bg-primary-700 ${
                loading 
                  ? 'opacity-75 cursor-not-allowed' 
                  : 'hover:bg-primary-700 dark:hover:bg-primary-600'
              } transition`}
            >
              {loading ? t('checkout.processing') : t('checkout.placeOrder')}
            </button>
          </form>

          {/* Payment Security Info */}
          <div className="mt-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Your information is secure</span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6 dark:text-white">{t('cart.orderSummary')}</h2>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium dark:text-white">{item.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium dark:text-white">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t('cart.subtotal')}</span>
                <span className="dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t('cart.shipping')}</span>
                <span className="dark:text-white">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t('cart.tax')}</span>
                <span className="dark:text-white">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-gray-700 pt-2">
                <span className="dark:text-white">{t('cart.total')}</span>
                <span className="dark:text-white">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Truck className="w-4 h-4 mr-2" />
                <span>{t('cart.freeShipping')}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Delivery within 3-5 business days</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Wallet className="w-4 h-4 mr-2" />
                <span>Secure payment options</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;