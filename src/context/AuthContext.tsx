import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  const [isAdmin, setIsAdmin] = useState<boolean>(localStorage.getItem('isAdmin') === 'true');
  const [loading, setLoading] = useState(true);

  // Helper function to check if user has admin role in app_metadata
  const checkIsAdmin = (user: User | null): boolean => {
    if (!user) return false;
    
    const appMetadata = user.app_metadata as { role?: string } || {};
    const userIsAdmin = appMetadata.role === 'admin';
    
    console.log(`[AUTH] Checking admin status for user: ${user.email}`);
    console.log(`[AUTH] app_metadata.role: ${appMetadata.role}`);
    console.log(`[AUTH] Is admin: ${userIsAdmin}`);
    
    return userIsAdmin;
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
    
    // Check for stored admin status first
    const storedAdminStatus = localStorage.getItem('isAdmin') === 'true';
    console.log(`[AUTH] Initial admin status from localStorage: ${storedAdminStatus ? 'true' : 'false'}`);
    
    // Set initial admin status from localStorage - this prevents flickering during auth check
    if (storedAdminStatus) {
      setIsAdmin(true);
    }
    
    // Only run auth checks if Supabase is configured
    if (isSupabaseConfigured()) {
      console.log('[AUTH] Checking Supabase auth session...');
      
      // Check active sessions and sets the user
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('[AUTH] Session retrieved:', session ? 'yes' : 'no');
        setUser(session?.user ?? null);
        
        // Check if user is an admin based on app_metadata
        if (session?.user) {
          const userIsAdmin = checkIsAdmin(session.user);
          console.log(`[AUTH] User authenticated, admin status: ${userIsAdmin}`);
          
          // Persist admin status in state and localStorage
          setIsAdmin(userIsAdmin);
          localStorage.setItem('isAdmin', userIsAdmin ? 'true' : 'false');
        } else {
          // No active user session
          console.log('[AUTH] No active user session');
        }
        
        setLoading(false);
      });

      // Listen for changes on auth state
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log(`[AUTH] Auth state changed: ${event}`);
        setUser(session?.user ?? null);
        
        // Check if user is an admin based on app_metadata
        if (session?.user) {
          const userIsAdmin = checkIsAdmin(session.user);
          console.log(`[AUTH] Auth state changed, admin status: ${userIsAdmin}`);
          
          setIsAdmin(userIsAdmin);
          localStorage.setItem('isAdmin', userIsAdmin ? 'true' : 'false');
        } else {
          console.log('[AUTH] Auth state changed: No user');
          setIsAdmin(false);
          localStorage.setItem('isAdmin', 'false');
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
      
      // Set user data
      setUser(data.user);
      
      // Check admin status from app_metadata
      const userIsAdmin = checkIsAdmin(data.user);
      setIsAdmin(userIsAdmin);
      localStorage.setItem('isAdmin', userIsAdmin ? 'true' : 'false');
      console.log(`[AUTH] Set isAdmin state to: ${userIsAdmin}`);
      
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