import React, { useState, useEffect } from 'react';
import ProductCard from '../shared/ProductCard';
import { getProductsByCategory } from '../../utils/productUtils';
import { useLanguage } from '../../context/LanguageContext';
import { Product } from '../../types/product';

interface FeaturedProductsProps {
  category: string;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ category }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProductsByCategory(category);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm animate-pulse">
            <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      {products.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-12">
          {t('product.noProducts') || 'No products found in this category.'}
        </p>
      )}
    </div>
  );
};

export default FeaturedProducts;