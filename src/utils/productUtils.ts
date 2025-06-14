import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types/product';

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any, operation: string) => {
  if (!isSupabaseConfigured()) {
    console.error(`❌ Cannot ${operation}: Supabase is not properly configured.`);
    console.error('Please check your .env file and update with valid Supabase credentials.');
    return;
  }
  
  console.error(`❌ Error ${operation}:`, error);
  
  if (error.message?.includes('Failed to fetch')) {
    console.error('🌐 Network error: Unable to connect to Supabase.');
    console.error('Please check:');
    console.error('1. Your internet connection');
    console.error('2. That your Supabase project is active (not paused)');
    console.error('3. That your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct');
  }
};

// This function now fetches products from Supabase instead of using local data
export const getProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select('*');
    
  if (error) {
    handleSupabaseError(error, 'fetching products');
    return [];
  }
  
  return data as Product[];
};

// Get a product by ID from Supabase
export const getProductById = async (id: string): Promise<Product | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    handleSupabaseError(error, 'fetching product');
    return null;
  }
  
  return data as Product;
};

// Get products by category from Supabase
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  if (category === 'new') {
    // Get products from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });
      
    if (error) {
      handleSupabaseError(error, 'fetching new products');
      return [];
    }
    
    return data as Product[];
  }

  if (category === 'featured') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('rating', { ascending: false })
      .limit(8);
      
    if (error) {
      handleSupabaseError(error, 'fetching featured products');
      return [];
    }
    
    return data as Product[];
  }

  if (category === 'sale') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .gt('discount', 0)
      .order('discount', { ascending: false });
      
    if (error) {
      handleSupabaseError(error, 'fetching sale products');
      return [];
    }
    
    return data as Product[];
  }

  if (!category || category === 'all') {
    // Return all products
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      handleSupabaseError(error, 'fetching all products');
      return [];
    }
    
    return data as Product[];
  }

  // Normalize category for comparison
  const normalizedCategory = category.toLowerCase().replace(/-/g, ' ').trim();
  
  console.log(`Searching for category: "${normalizedCategory}"`);
  
  // Use exact match with case-insensitive comparison
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('category', normalizedCategory);
    
  if (error) {
    handleSupabaseError(error, `fetching products by category "${normalizedCategory}"`);
    return [];
  }
  
  console.log(`Found ${data?.length || 0} products for category "${normalizedCategory}"`);
  
  return data as Product[];
};

// Get related products from Supabase
export const getRelatedProducts = async (productId: string, category: string): Promise<Product[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .neq('id', productId)
    .limit(4);
    
  if (error) {
    handleSupabaseError(error, 'fetching related products');
    return [];
  }
  
  return data as Product[];
};

// Get all unique categories from products
export const getCategories = async (): Promise<string[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select('category')
    .order('category');
    
  if (error) {
    handleSupabaseError(error, 'fetching categories');
    return [];
  }
  
  // Extract unique categories
  const categories = [...new Set(data.map(item => item.category))];
  return categories;
};