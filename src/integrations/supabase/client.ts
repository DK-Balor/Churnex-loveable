
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://atobskmygodtszvfmtww.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0b2Jza215Z29kdHN6dmZtdHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjcwODMsImV4cCI6MjA1ODQwMzA4M30.y7Z4DYunMGOba6AgbSrYY6j_SqOrm1XRIAfTSmcw6EY';

// Session expiry in seconds (24 hours)
export const SESSION_EXPIRY = 24 * 60 * 60;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    flowType: 'pkce',
    debug: true // Enable this to see detailed auth logs
  }
});

// Add a helper function to handle email verification
export const sendVerificationEmail = async (email: string) => {
  try {
    console.log('Sending verification email to:', email);
    
    // Use signInWithOtp instead of signUp for more reliable email delivery
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth?verification=link`,
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

// Add a helper function to handle email verification using code from URL
export const verifyEmailWithLink = async () => {
  try {
    console.log('Verifying email with link');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error verifying email with link:', error);
      return { error, data: null };
    }
    
    console.log('Email verification with link result:', data);
    return { error: null, data };
  } catch (error) {
    console.error('Exception verifying email with link:', error);
    return { error: error as Error, data: null };
  }
};
