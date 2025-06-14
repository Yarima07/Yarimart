import { createClient } from '@supabase/supabase-js';

// Function to get environment variables in Vite environment
const getEnvVariable = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue;
};

// Get Supabase credentials from environment variables
const supabaseUrl = getEnvVariable('VITE_SUPABASE_URL', '');
const supabaseAnonKey = getEnvVariable('VITE_SUPABASE_ANON_KEY', '');

// Validate configuration
const isValidUrl = supabaseUrl && 
  supabaseUrl !== '' && 
  supabaseUrl !== 'https://example.supabase.co' && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseUrl.includes('supabase.co');

const isValidKey = supabaseAnonKey && 
  supabaseAnonKey !== '' && 
  supabaseAnonKey !== 'example-key' && 
  supabaseAnonKey !== 'your-anon-public-key';

if (!isValidUrl) {
  console.error('❌ Invalid or missing VITE_SUPABASE_URL.');
  console.error('Please update your .env file with your actual Supabase project URL.');
  console.error('Example: VITE_SUPABASE_URL=https://abcdefghijk.supabase.co');
}

if (!isValidKey) {
  console.error('❌ Invalid or missing VITE_SUPABASE_ANON_KEY.');
  console.error('Please update your .env file with your actual Supabase anon key.');
  console.error('You can find both values in your Supabase dashboard under Settings > API');
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
  const isConfigured = isValidUrl && isValidKey;
  
  if (!isConfigured) {
    console.error('🔧 Supabase is NOT properly configured.');
    console.error('Please check your .env file and update with valid credentials.');
    console.error('Authentication and data operations will not work until this is fixed!');
  } else {
    console.log('✅ Supabase is properly configured');
  }
  
  return isConfigured;
};

// Call isSupabaseConfigured immediately to detect issues early
isSupabaseConfigured();