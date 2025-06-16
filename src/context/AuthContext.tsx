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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Helper function to check if user has admin role in app_metadata
  const checkIsAdmin = (user: User | null): boolean => {
    if (!user) return false;
    
    const appMetadata = user.app_metadata as { role?: string } || {};
    const userIsAdmin = appMetadata.role === 'admin';
    
    return userIsAdmin;
  };

  useEffect(() => {
    // If Supabase is not configured, set loading to false and return
    if (!isSupabaseConfigured()) {
      console.log('[AUTH] Supabase not configured, running in demo mode');
      setLoading(false);
      return;
    }

    console.log('[AUTH] Provider initialized');
    
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH] Session retrieved:', session ? 'yes' : 'no');
      setUser(session?.user ?? null);
      
      // Check if user is an admin based on app_metadata
      if (session?.user) {
        const userIsAdmin = checkIsAdmin(session.user);
        console.log(`[AUTH] User authenticated, admin status: ${userIsAdmin}`);
        setIsAdmin(userIsAdmin);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    }).catch(error => {
      console.error('[AUTH] Error getting session:', error);
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
      } else {
        console.log('[AUTH] Auth state changed: No user');
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Authentication is not available in demo mode');
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
      throw new Error('Authentication is not available in demo mode');
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
      console.log(`[AUTH] Set isAdmin state to: ${userIsAdmin}`);
      
      return;
    } catch (err) {
      console.error("[AUTH] Sign in exception:", err);
      throw err;
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      // For demo mode, just clear the state
      setUser(null);
      setIsAdmin(false);
      return;
    }
    
    console.log("[AUTH] Signing out");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[AUTH] Sign out error:", error);
      throw error;
    }
    
    console.log("[AUTH] Sign out successful");
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};