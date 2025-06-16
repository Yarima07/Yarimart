import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types/product';

// Demo products for when Supabase is not configured or not reachable
const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-1',
    name: 'Professional Impact Drill',
    price: 24999,
    discount: 10,
    description: 'Heavy-duty impact drill with variable speed control and hammer function. Perfect for professional use.',
    category: 'Power Tools',
    subcategory: 'Drills',
    tags: ['drill', 'impact', 'professional'],
    images: [
      'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg',
      'https://images.pexels.com/photos/4489794/pexels-photo-4489794.jpeg'
    ],
    colors: ['Black', 'Blue', 'Red'],
    sizes: ['Standard', 'Compact'],
    specifications: {
      power: '1200W',
      voltage: '230V',
      weight: '2.9kg',
      dimensions: '362 x 102 x 114mm',
      warranty: '3 years',
      manufacturer: 'YariTools Pro',
      countryOfOrigin: 'India'
    },
    rating: 4.8,
    reviews: 245,
    createdAt: new Date().toISOString(),
    stock: 50
  },
  {
    id: 'demo-2',
    name: 'Safety Helmet Premium',
    price: 2499,
    discount: 0,
    description: 'High-quality safety helmet with adjustable fitting and ventilation.',
    category: 'Safety Equipment',
    subcategory: 'Head Protection',
    tags: ['safety', 'helmet', 'protection'],
    images: [
      'https://images.pexels.com/photos/8005397/pexels-photo-8005397.jpeg',
      'https://images.pexels.com/photos/8005398/pexels-photo-8005398.jpeg'
    ],
    colors: ['White', 'Yellow', 'Red', 'Blue'],
    sizes: ['M', 'L', 'XL'],
    specifications: {
      material: 'High-impact ABS',
      weight: '450g',
      warranty: '1 year',
      manufacturer: 'YariSafety',
      countryOfOrigin: 'India'
    },
    rating: 4.7,
    reviews: 156,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    stock: 200
  },
  {
    id: 'demo-3',
    name: 'Industrial Air Compressor',
    price: 89999,
    discount: 0,
    description: 'High-capacity industrial air compressor with dual-stage compression.',
    category: 'Industrial Equipment',
    subcategory: 'Compressors',
    tags: ['compressor', 'industrial', 'heavy-duty'],
    images: [
      'https://images.pexels.com/photos/210881/pexels-photo-210881.jpeg',
      'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg'
    ],
    sizes: ['50L', '100L'],
    specifications: {
      power: '5500W',
      voltage: '400V',
      weight: '125kg',
      warranty: '3 years',
      manufacturer: 'YariIndustrial',
      countryOfOrigin: 'India'
    },
    rating: 4.9,
    reviews: 78,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    stock: 15
  },
  {
    id: 'demo-4',
    name: 'Professional Screwdriver Set',
    price: 3999,
    discount: 20,
    description: '32-piece professional screwdriver set with magnetic tips and ergonomic handles.',
    category: 'Hand Tools',
    subcategory: 'Screwdrivers',
    tags: ['screwdriver', 'set', 'professional', 'magnetic'],
    images: [
      'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
      'https://images.pexels.com/photos/4489794/pexels-photo-4489794.jpeg'
    ],
    specifications: {
      pieces: '32',
      material: 'Chrome Vanadium Steel',
      weight: '1.2kg',
      warranty: '5 years',
      manufacturer: 'YariTools',
      countryOfOrigin: 'India'
    },
    rating: 4.6,
    reviews: 287,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    stock: 120
  }
];

// Track if we've already shown network error warning to avoid spam
let networkErrorShown = false;

// Helper function to handle Supabase errors gracefully
const handleSupabaseError = (error: any, operation: string): boolean => {
  // Check if this is a network connectivity issue
  const isNetworkError = error.message?.includes('Failed to fetch') || 
                         error.message?.includes('NetworkError') ||
                         error.code === 'NETWORK_ERROR' ||
                         error.name === 'TypeError';

  if (isNetworkError && !networkErrorShown) {
    console.info('🔌 Network connectivity issue detected. Running in offline mode with demo data.');
    console.info('💡 This is normal if you\'re offline or if there are temporary network issues.');
    networkErrorShown = true;
    return true;
  }

  // For non-network errors, show more specific error information
  if (!isNetworkError) {
    console.warn(`⚠️ Database ${operation} issue:`, error.message || error);
    console.info('📱 Switching to demo mode for continued functionality.');
  }

  return isNetworkError;
};

// Enhanced network connectivity check
const checkNetworkConnectivity = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    // Try a simple health check query with timeout
    const { error } = await Promise.race([
      supabase.from('products').select('id').limit(1).single(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      )
    ]) as any;

    return !error;
  } catch (error) {
    return false;
  }
};

// This function now fetches products from Supabase or returns demo data
export const getProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) {
    console.log('📱 Using demo products (Supabase not configured)');
    return DEMO_PRODUCTS;
  }

  try {
    const { data, error } = await Promise.race([
      supabase.from('products').select('*'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
    ]) as any;
      
    if (error) {
      const isNetworkError = handleSupabaseError(error, 'fetching products');
      return DEMO_PRODUCTS; // Always fallback to demo data
    }
    
    // Successfully got data from Supabase
    if (networkErrorShown) {
      console.info('✅ Network connectivity restored. Using live data.');
      networkErrorShown = false;
    }
    
    return data as Product[];
  } catch (error) {
    handleSupabaseError(error, 'fetching products');
    return DEMO_PRODUCTS;
  }
};

// Get a product by ID from Supabase or demo data
export const getProductById = async (id: string): Promise<Product | null> => {
  if (!isSupabaseConfigured()) {
    return DEMO_PRODUCTS.find(p => p.id === id) || null;
  }

  try {
    const { data, error } = await Promise.race([
      supabase.from('products').select('*').eq('id', id).single(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
    ]) as any;
      
    if (error) {
      handleSupabaseError(error, 'fetching product');
      return DEMO_PRODUCTS.find(p => p.id === id) || null;
    }
    
    return data as Product;
  } catch (error) {
    handleSupabaseError(error, 'fetching product');
    return DEMO_PRODUCTS.find(p => p.id === id) || null;
  }
};

// Get products by category from Supabase or demo data
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const allProducts = await getProducts();
  
  if (category === 'new') {
    // Get products from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return allProducts
      .filter(product => new Date(product.createdAt) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  if (category === 'featured') {
    return allProducts
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }

  if (category === 'sale') {
    return allProducts
      .filter(product => product.discount > 0)
      .sort((a, b) => b.discount - a.discount);
  }

  if (!category || category === 'all') {
    return allProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Normalize category for comparison
  const normalizedCategory = category.toLowerCase().replace(/-/g, ' ').trim();
  
  return allProducts.filter(product => 
    product.category.toLowerCase() === normalizedCategory
  );
};

// Get related products
export const getRelatedProducts = async (productId: string, category: string): Promise<Product[]> => {
  const allProducts = await getProducts();
  
  return allProducts
    .filter(product => product.category === category && product.id !== productId)
    .slice(0, 4);
};

// Get all unique categories from products
export const getCategories = async (): Promise<string[]> => {
  const allProducts = await getProducts();
  
  // Extract unique categories
  const categories = [...new Set(allProducts.map(product => product.category))];
  return categories.sort();
};

// Export network connectivity check for use in components
export { checkNetworkConnectivity };