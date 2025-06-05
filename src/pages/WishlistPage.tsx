import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/shared/ProductCard';
import BreadcrumbNav from '../components/shared/BreadcrumbNav';
import { useLanguage } from '../context/LanguageContext';

const WishlistPage: React.FC = () => {
  const { wishlist, clearWishlist } = useWishlist();
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbNav 
        items={[
          { name: 'Home', href: '/' },
          { name: t('common.wishlist') }
        ]} 
      />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold dark:text-white">{t('common.wishlist')}</h1>
        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Your wishlist is empty</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Save items you love to your wishlist and revisit them anytime.</p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;