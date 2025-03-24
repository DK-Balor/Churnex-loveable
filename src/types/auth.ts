
import { User, Session } from '@supabase/supabase-js';

export type UserProfile = {
  id: string;
  full_name: string | null;
  business_name: string | null;
  subscription_plan: string | null;
  trial_ends_at: string | null;
  last_active_at?: string | null;
  last_login_at?: string | null;
  login_count?: number;
};

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  emailConfirmed: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    emailVerificationNeeded?: boolean;
    data?: any;
  }>;
  signUp: (email: string, password: string, fullName: string, businessName: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signOut: () => Promise<void>;
  verifyEmail: (email: string, token: string) => Promise<{
    error: Error | null;
  }>;
  resendVerificationEmail: (email: string) => Promise<{
    error: Error | null;
  }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{
    error: Error | null;
    data: UserProfile | null;
  }>;
};
