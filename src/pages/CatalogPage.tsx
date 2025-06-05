import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import ProductCard from '../components/shared/ProductCard';
import { getProductsByCategory } from '../utils/productUtils';
import BreadcrumbNav from '../components/shared/BreadcrumbNav';
import { Product } from '../types/product';
import { useRegion } from '../context/RegionContext';
import { useLanguage } from '../context/LanguageContext';

const CatalogPage: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const { convertPrice } = useRegion();
  const { t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let fetchedProducts = await getProductsByCategory(category || '');
        
        // Apply search filter if search query exists
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          fetchedProducts = fetchedProducts.filter(product => 
            product.name.toLowerCase().includes(query) || 
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query));
        }
        
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [category, searchQuery]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    // Price filter
    filtered = filtered.filter(product => {
      const finalPrice = product.discount > 0 
        ? product.price * (1 - product.discount / 100) 
        : product.price;
      const convertedPrice = convertPrice(finalPrice);
      return convertedPrice >= priceRange[0] && convertedPrice <= priceRange[1];
    });
    
    // Sorting
    switch (sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => {
          const priceA = convertPrice(a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price);
          const priceB = convertPrice(b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price);
          return priceA - priceB;
        });
        break;
      case 'price-high-low':
        filtered.sort((a, b) => {
          const priceA = convertPrice(a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price);
          const priceB = convertPrice(b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price);
          return priceB - priceA;
        });
        break;
      case 'popular':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    return filtered;
  }, [products, priceRange, sortBy, convertPrice]);

  const toggleFilterMenu = useCallback(() => {
    setIsFilterMenuOpen(prev => !prev);
  }, []);

  const resetFilters = useCallback(() => {
    setPriceRange([0, 100000]);
    setSortBy('newest');
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav 
        items={[
          { name: 'Home', href: '/' },
          { name: category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products' }
        ]} 
      />

      <div className="flex justify-between items-center my-6">
        <h1 className="text-2xl md:text-3xl font-bold dark:text-white">
          {searchQuery 
            ? `${t('catalog.searchResults')}: "${searchQuery}"` 
            : category 
              ? `${category.charAt(0).toUpperCase() + category.slice(1)}` 
              : t('catalog.allProducts')}
        </h1>
        
        <button 
          onClick={toggleFilterMenu}
          className="md:hidden flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
        >
          <Filter className="h-5 w-5 mr-1" />
          {t('catalog.filters')}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter sidebar - desktop */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg dark:text-white">{t('catalog.filters')}</h2>
              <button 
                onClick={resetFilters}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition"
              >
                {t('catalog.reset')}
              </button>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-medium mb-3 dark:text-gray-300">{t('catalog.priceRange')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-primary-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile filter menu */}
        {isFilterMenuOpen && (
          <div className="fixed inset-0 z-40 bg-gray-800 bg-opacity-75 flex md:hidden">
            <div className="bg-white dark:bg-gray-800 w-80 max-w-full h-full overflow-y-auto ml-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg dark:text-white">{t('catalog.filters')}</h2>
                <button onClick={toggleFilterMenu}>
                  <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">
                  {t('catalog.filteredProducts')}: {filteredProducts.length}
                </h3>
                <button 
                  onClick={resetFilters}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition"
                >
                  {t('catalog.resetAll')}
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium mb-3 dark:text-gray-300">{t('catalog.priceRange')}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-primary-600"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={toggleFilterMenu}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 transition dark:bg-primary-700 dark:hover:bg-primary-600"
                >
                  {t('catalog.showResults')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-grow">
          {/* Sorting and results count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-500 dark:text-gray-400">
              {t('catalog.showing')} {filteredProducts.length} {filteredProducts.length === 1 
                ? t('catalog.product') 
                : t('catalog.products')}
            </p>
            
            <div className="flex items-center">
              <label htmlFor="sort" className="text-sm text-gray-500 dark:text-gray-400 mr-2">{t('catalog.sortBy')}:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md text-sm p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="newest">{t('catalog.newest')}</option>
                <option value="price-low-high">{t('catalog.priceLowHigh')}</option>
                <option value="price-high-low">{t('catalog.priceHighLow')}</option>
                <option value="popular">{t('catalog.popular')}</option>
              </select>
            </div>
          </div>

          {/* Product grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500 dark:text-gray-400">{t('catalog.noProducts')}</p>
              <button 
                onClick={resetFilters}
                className="mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition"
              >
                {t('catalog.resetFilters')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;