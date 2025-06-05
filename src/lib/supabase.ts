import { createClient } from '@supabase/supabase-js';

// Function to get environment variables in Vite environment
const getEnvVariable = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue;
};

// Default values for development to prevent crashes
const supabaseUrl = getEnvVariable('VITE_SUPABASE_URL', 'https://example.supabase.co');
const supabaseAnonKey = getEnvVariable('VITE_SUPABASE_ANON_KEY', 'example-key');

// Log the configuration for debugging
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Supabase Anon Key provided: ${supabaseAnonKey !== 'example-key'}`);

// Create the Supabase client with explicit auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit'
  }
});

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const url = getEnvVariable('VITE_SUPABASE_URL', 'https://example.supabase.co');
  const key = getEnvVariable('VITE_SUPABASE_ANON_KEY', 'example-key');
  
  const isConfigured = (
    url !== undefined &&
    url !== 'https://example.supabase.co' &&
    key !== undefined &&
    key !== 'example-key'
  );
  
  if (isConfigured) {
    console.log('Supabase is properly configured');
  } else {
    console.warn('Supabase is NOT properly configured. Authentication will not work!');
    console.warn(`URL check: ${url !== 'https://example.supabase.co'}`);
    console.warn(`Key check: ${key !== 'example-key'}`);
  }
  
  return isConfigured;
};