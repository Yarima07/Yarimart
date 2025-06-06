import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// List of admin emails
const ADMIN_EMAILS = [
  'pamacomkb@gmail.com',
  'yarimaind@gmail.com', 
  'pamacospares@gmail.com', 
  'fortunemillstores@gmail.com'
];

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    // Initialize from localStorage on component mount
    return localStorage.getItem('isAdmin') === 'true';
  });
  const [loading, setLoading] = useState(true);

  // Helper function to check if an email is in the admin list
  const checkIsAdminEmail = (email: string): boolean => {
    if (!email) return false;
    
    const normalizedEmail = email.toLowerCase().trim();
    for (const adminEmail of ADMIN_EMAILS) {
      if (adminEmail.toLowerCase().trim() === normalizedEmail) {
        console.log(`[AUTH] Email ${normalizedEmail} is recognized as admin`);
        return true;
      }
    }
    console.log(`[AUTH] Email ${normalizedEmail} is NOT an admin`);
    return false;
  };

  // Update localStorage whenever isAdmin changes
  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem('isAdmin', 'true');
      console.log('[AUTH] Admin status set to TRUE in localStorage');
    } else {
      // Only remove if we're sure the user is not an admin
      if (user !== null) {
        localStorage.setItem('isAdmin', 'false');
        console.log('[AUTH] Admin status set to FALSE in localStorage');
      }
    }
  }, [isAdmin, user]);

  useEffect(() => {
    console.log('[AUTH] Provider initialized');
    console.log(`[AUTH] Initial admin status from localStorage: ${localStorage.getItem('isAdmin')}`);
    
    // Only run auth checks if Supabase is configured
    if (isSupabaseConfigured()) {
      console.log('[AUTH] Checking Supabase auth session...');
      
      // Check active sessions and sets the user
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('[AUTH] Session retrieved:', session ? 'yes' : 'no');
        setUser(session?.user ?? null);
        
        // Check if user is an admin
        if (session?.user) {
          const userEmail = session.user.email || '';
          const userIsAdmin = checkIsAdminEmail(userEmail);
          console.log(`[AUTH] User authenticated, checking admin status for: ${userEmail}`);
          console.log(`[AUTH] Admin check result: ${userIsAdmin}`);
          
          setIsAdmin(userIsAdmin);
        } else {
          console.log('[AUTH] No active user session');
          // Only clear admin status if we're sure there's no user
          setIsAdmin(false);
        }
        
        setLoading(false);
      });

      // Listen for changes on auth state
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log(`[AUTH] Auth state changed: ${event}`);
        setUser(session?.user ?? null);
        
        // Check if user is an admin
        if (session?.user) {
          const userEmail = session.user.email || '';
          const userIsAdmin = checkIsAdminEmail(userEmail);
          console.log(`[AUTH] Auth state changed, checking admin for: ${userEmail}`);
          console.log(`[AUTH] Admin check result: ${userIsAdmin}`);
          
          setIsAdmin(userIsAdmin);
        } else {
          console.log('[AUTH] Auth state changed: No user');
          setIsAdmin(false);
        }
        
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      console.error('[AUTH] Supabase is not properly configured');
      // If Supabase is not configured, just set loading to false
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      console.error('[AUTH] Supabase is not properly configured');
      throw new Error('Authentication service is not available');
    }
    
    console.log(`[AUTH] Attempting to sign up: ${email}`);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error("[AUTH] Sign up error:", error.message);
      throw error;
    }
    
    console.log("[AUTH] Sign up response:", data);
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      console.error('[AUTH] Supabase is not properly configured');
      throw new Error('Authentication service is not available');
    }
    
    console.log(`[AUTH] Attempting to sign in: ${email}`);
    
    try {
      // First check if this is an admin email
      const isAdminUser = checkIsAdminEmail(email);
      console.log(`[AUTH] Is admin email check result: ${isAdminUser}`);
      
      // Set the admin status in localStorage immediately to ensure persistence
      if (isAdminUser) {
        localStorage.setItem('isAdmin', 'true');
        console.log('[AUTH] Set admin=true in localStorage before login');
      } else {
        localStorage.setItem('isAdmin', 'false');
        console.log('[AUTH] Set admin=false in localStorage before login');
      }
      
      // Sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("[AUTH] Sign in error:", error);
        throw error;
      }
      
      console.log("[AUTH] Sign in successful:", data.user?.email);
      
      // Update admin status in state
      setIsAdmin(isAdminUser);
      console.log(`[AUTH] Set isAdmin state to: ${isAdminUser}`);
      
      return;
    } catch (err) {
      console.error("[AUTH] Sign in exception:", err);
      throw err;
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      console.error('[AUTH] Supabase is not properly configured');
      throw new Error('Authentication service is not available');
    }
    
    console.log("[AUTH] Signing out");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[AUTH] Sign out error:", error);
      throw error;
    }
    
    console.log("[AUTH] Sign out successful");
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    console.log("[AUTH] Removed admin status from localStorage");
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};