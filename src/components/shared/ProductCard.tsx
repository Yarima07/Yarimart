import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Product } from '../../types/product';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useRegion } from '../../context/RegionContext';
import { useLanguage } from '../../context/LanguageContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useRegion();
  const { t } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...product,
      selectedSize: product.sizes ? product.sizes[0] : '',
      selectedColor: product.colors ? product.colors[0] : '',
    }, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link 
      to={`/product/${product.id}`} 
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 dark:bg-gray-800"
    >
      <div className="relative">
        <div className="w-full aspect-square relative overflow-hidden rounded-t-lg">
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
              {product.discount}% OFF
            </span>
          )}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 p-2 rounded-full z-10 transition
              ${isWishlisted 
                ? 'bg-primary-100 text-accent-500 dark:bg-primary-800' 
                : 'bg-white text-gray-400 hover:text-accent-500 dark:bg-gray-700 dark:text-gray-300'}`}
          >
            <Heart className={isWishlisted ? 'fill-accent-500' : ''} size={20} />
          </button>
          
          <div className="w-full h-full relative">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}
            <img
              src={product.images[0]}
              alt={product.name}
              className={`w-full h-full object-cover transition duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/50 to-transparent pt-10 pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleAddToCart}
              className="mx-auto block bg-white text-primary-900 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              {t('product.addToCart')}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition line-clamp-2 min-h-[2.5rem] dark:text-white dark:group-hover:text-primary-400">
          {product.name}
        </h3>
        
        <div className="mt-2 flex items-center">
          {product.discount > 0 ? (
            <>
              <span className="text-accent-600 font-medium dark:text-accent-400">
                {formatPrice(product.price * (1 - product.discount / 100))}
              </span>
              <span className="ml-2 text-gray-500 text-sm line-through dark:text-gray-400">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-gray-900 font-medium dark:text-white">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        
        {product.stock < 10 && (
          <p className="text-sm text-accent-600 mt-2 dark:text-accent-400">
            {t('product.onlyLeft').replace('{count}', product.stock.toString())}
          </p>
        )}
      </div>
    </Link>
  );
};

export default React.memo(ProductCard);