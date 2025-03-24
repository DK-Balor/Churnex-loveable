
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://atobskmygodtszvfmtww.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0b2Jza215Z29kdHN6dmZtdHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjcwODMsImV4cCI6MjA1ODQwMzA4M30.y7Z4DYunMGOba6AgbSrYY6j_SqOrm1XRIAfTSmcw6EY';

// Session expiry in seconds (24 hours)
export const SESSION_EXPIRY = 24 * 60 * 60;

// Fixed production URL for redirects
const SITE_URL = 'https://churnex.lovable.app';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    flowType: 'pkce',
    debug: true, // Enable this to see detailed auth logs
    // Use the fixed site URL for redirects without any query parameters
    redirectTo: `${SITE_URL}/auth`
  }
});

// Add a helper function to handle email verification
export const sendVerificationEmail = async (email: string) => {
  try {
    console.log('Sending verification email to:', email);
    
    const redirectUrl = `${SITE_URL}/auth`;
    console.log('Using redirect URL:', redirectUrl);
    
    // Use signInWithOtp instead of signUp for more reliable email delivery
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: true
      }
    });
    
    if (error) {
      console.error('Error sending verification email:', error);
      return { error };
    }
    
    console.log('Verification email sent successfully');
    return { error: null };
  } catch (error) {
    console.error('Exception sending verification email:', error);
    return { error: error as Error };
  }
};
