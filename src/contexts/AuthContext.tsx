
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signUpUser } from '../integrations/supabase/client';
import { useToast } from '../components/ui/use-toast';
import { AuthContextType } from '../types/auth';
import { checkSessionExpiry, updateUserActivity, trackUserLogin } from '../utils/authUtils';
import { useProfile } from '../hooks/useProfile';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { profile, isProfileLoading, updateProfile } = useProfile(user);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Handle session expiry
        if (session && checkSessionExpiry(session)) {
          console.log('Session expired, signing out');
          supabase.auth.signOut();
          toast({
            title: "Session expired",
            description: "Your session has expired. Please sign in again.",
            variant: "default",
          });
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Update user activity when session changes
        if (session?.user) {
          updateUserActivity(session.user.id);
        }
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome!",
            description: `You're now signed in as ${session?.user?.email}`,
          });
          
          // Track login when user signs in
          if (session?.user) {
            trackUserLogin(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Existing session check:', session?.user?.email);
      
      // Check if the existing session has expired
      if (session && checkSessionExpiry(session)) {
        console.log('Existing session expired, signing out');
        supabase.auth.signOut();
        toast({
          title: "Session expired",
          description: "Your session has expired. Please sign in again.",
          variant: "default",
        });
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Update user activity on initial load if user is logged in
      if (session?.user) {
        updateUserActivity(session.user.id);
      }
    });

    // Set up an interval to check for session expiry every minute
    const checkInterval = setInterval(() => {
      if (session && checkSessionExpiry(session)) {
        console.log('Session expired during active use, signing out');
        supabase.auth.signOut();
        toast({
          title: "Session expired",
          description: "Your session has expired. Please sign in again.",
          variant: "default",
        });
      }
    }, 60 * 1000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(checkInterval);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        options: {
          // Set session expiry to 24 hours
          expiresIn: 24 * 60 * 60
        }
      });
      
      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Authentication failed",
          description: error.message,
          variant: "destructive",
        });
      }
      
      return { error, data };
    } catch (error) {
      console.error('Sign in exception:', error);
      toast({
        title: "Authentication error",
        description: "An unexpected error occurred during sign in.",
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, businessName: string) => {
    try {
      console.log('Signing up user directly:', email);
      
      // Use the new signUpUser function that doesn't require email verification
      const { error, data } = await signUpUser(email, password, fullName, businessName);

      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      } 
      
      console.log('Signup successful, user should be logged in automatically');
      toast({
        title: "Account created",
        description: "Your account has been created and you are now logged in.",
      });

      return { error: null, data };
    } catch (error) {
      console.error('Sign up exception:', error);
      toast({
        title: "Signup error",
        description: "An unexpected error occurred during sign up.",
        variant: "destructive",
      });
      return { error: error as Error, data: null };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    isProfileLoading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
