
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { UserProfile } from '../types/auth';
import { useToast } from '../components/ui/use-toast';

export const useProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setIsProfileLoading(false);
        return;
      }

      try {
        setIsProfileLoading(true);
        const { data, error } = await supabase
          .from('user_metadata')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          // If the profile doesn't exist, create a new one
          if (error.code === 'PGRST116') {
            // Get user metadata from auth
            const { data: authUser } = await supabase.auth.getUser();
            const userMetadata = authUser?.user?.user_metadata;
            
            // Create profile with data from auth metadata
            const { data: newProfile, error: createError } = await supabase
              .from('user_metadata')
              .insert([{ 
                id: user.id,
                full_name: userMetadata?.full_name || null,
                business_name: userMetadata?.business_name || null,
                trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7-day trial
              }])
              .select('*')
              .single();

            if (createError) {
              console.error('Error creating user profile:', createError);
              toast({
                title: "Error",
                description: "Failed to create user profile. Please refresh the page or contact support.",
                variant: "destructive",
              });
            } else {
              setProfile(newProfile);
              toast({
                title: "Profile created",
                description: "Your account has been set up successfully.",
              });
            }
          } else {
            console.error('Error fetching user profile:', error);
            toast({
              title: "Error",
              description: "Failed to load your profile. Please refresh the page.",
              variant: "destructive",
            });
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error in profile fetch:', err);
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return { error: new Error('User not authenticated'), data: null };
    }

    try {
      const { data, error } = await supabase
        .from('user_metadata')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      return { error: null, data };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
      return { error: error as Error, data: null };
    }
  };

  return { profile, isProfileLoading, updateProfile };
};
