
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signUpUser } from '../integrations/supabase/client';
import { useToast } from '../components/ui/use-toast';
import { checkSessionExpiry, updateUserActivity } from '../utils/authUtils';
import { useProfile } from './useProfile';

export const useAuthProvider = () => {
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

  return {
    user,
    session,
    profile,
    isLoading,
    isProfileLoading,
    updateProfile,
    setUser,
    setSession
  };
};
