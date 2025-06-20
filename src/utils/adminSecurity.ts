import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface SecurityEvent {
  event: string;
  userId?: string;
  userEmail?: string;
  details?: any;
  timestamp: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
}

export interface AdminValidationResult {
  isValid: boolean;
  reason?: string;
  shouldRetry?: boolean;
}

// Rate limiting for security events
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ATTEMPTS = 10;

export const checkRateLimit = (key: string): boolean => {
  const now = Date.now();
  const attempts = rateLimitMap.get(key) || [];
  
  // Clean old attempts
  const recentAttempts = attempts.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return false; // Rate limited
  }
  
  recentAttempts.push(now);
  rateLimitMap.set(key, recentAttempts);
  return true;
};

export const logSecurityEvent = async (event: SecurityEvent): Promise<void> => {
  try {
    console.log('[SECURITY EVENT]', event);
    
    // Rate limit logging to prevent spam
    const key = `${event.userId || 'anonymous'}_${event.event}`;
    if (!checkRateLimit(key)) {
      console.warn('[SECURITY] Rate limit exceeded for:', key);
      return;
    }
    
    // In production, send to monitoring service
    if (import.meta.env.PROD) {
      // Example: Send to your logging service
      await fetch('/api/admin/security-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify(event)
      }).catch(error => {
        console.error('[SECURITY] Failed to log event:', error);
      });
    }
    
    // Store in localStorage for debugging (development only)
    if (import.meta.env.DEV) {
      const logs = JSON.parse(localStorage.getItem('admin_security_logs') || '[]');
      logs.push(event);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('admin_security_logs', JSON.stringify(logs));
    }
  } catch (error) {
    console.error('[SECURITY] Error logging security event:', error);
  }
};

const getAuthToken = async (): Promise<string | null> => {
  if (!isSupabaseConfigured()) return null;
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
};

export const validateAdminSession = async (): Promise<AdminValidationResult> => {
  try {
    if (!isSupabaseConfigured()) {
      return {
        isValid: false,
        reason: 'Supabase not configured',
        shouldRetry: false
      };
    }

    // Check session validity
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      await logSecurityEvent({
        event: 'session_validation_error',
        details: { error: sessionError.message },
        timestamp: new Date().toISOString()
      });
      
      return {
        isValid: false,
        reason: 'Session error',
        shouldRetry: true
      };
    }

    if (!session) {
      await logSecurityEvent({
        event: 'no_session',
        timestamp: new Date().toISOString()
      });
      
      return {
        isValid: false,
        reason: 'No active session',
        shouldRetry: false
      };
    }

    // Validate admin role
    const user = session.user;
    const appMetadata = user.app_metadata as { role?: string } || {};
    
    if (appMetadata.role !== 'admin') {
      await logSecurityEvent({
        event: 'invalid_admin_role',
        userId: user.id,
        userEmail: user.email,
        details: { role: appMetadata.role },
        timestamp: new Date().toISOString()
      });
      
      return {
        isValid: false,
        reason: 'Insufficient privileges',
        shouldRetry: false
      };
    }

    // Test database connectivity
    const { error: dbError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (dbError) {
      await logSecurityEvent({
        event: 'database_connectivity_error',
        userId: user.id,
        userEmail: user.email,
        details: { error: dbError.message },
        timestamp: new Date().toISOString()
      });
      
      return {
        isValid: false,
        reason: 'Database connectivity issue',
        shouldRetry: true
      };
    }

    // Success
    await logSecurityEvent({
      event: 'admin_session_validated',
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date().toISOString()
    });

    return {
      isValid: true
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await logSecurityEvent({
      event: 'session_validation_exception',
      details: { error: errorMessage },
      timestamp: new Date().toISOString()
    });
    
    return {
      isValid: false,
      reason: 'Validation failed',
      shouldRetry: true
    };
  }
};

export const createSecureHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const validateInputLength = (input: string, maxLength: number = 1000): boolean => {
  return input.length <= maxLength;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getSecurityLogs = (): SecurityEvent[] => {
  if (!import.meta.env.DEV) return [];
  
  try {
    return JSON.parse(localStorage.getItem('admin_security_logs') || '[]');
  } catch {
    return [];
  }
};

export const clearSecurityLogs = (): void => {
  if (import.meta.env.DEV) {
    localStorage.removeItem('admin_security_logs');
  }
};