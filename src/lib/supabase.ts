import { createClient } from '@supabase/supabase-js';

// Function to get environment variables in Vite environment
const getEnvVariable = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue;
};

// Get Supabase credentials from environment variables
const supabaseUrl = getEnvVariable('VITE_SUPABASE_URL', '');
const supabaseAnonKey = getEnvVariable('VITE_SUPABASE_ANON_KEY', '');

// Validate configuration
if (!supabaseUrl || supabaseUrl === 'https://example.supabase.co') {
  console.error('Invalid or missing VITE_SUPABASE_URL. Please check your .env file.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'example-key') {
  console.error('Invalid or missing VITE_SUPABASE_ANON_KEY. Please check your .env file.');
}

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
  const isConfigured = (
    supabaseUrl !== '' && 
    supabaseUrl !== 'https://example.supabase.co' &&
    supabaseAnonKey !== '' &&
    supabaseAnonKey !== 'example-key'
  );
  
  if (!isConfigured) {
    console.error('Supabase is NOT properly configured. Authentication and data operations will not work!');
    console.error(`Check that your .env file contains valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY values.`);
  } else {
    console.log('Supabase is properly configured');
  }
  
  return isConfigured;
};

// Call isSupabaseConfigured immediately to detect issues early
isSupabaseConfigured();