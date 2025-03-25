
import React, { useEffect, useState } from 'react';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import WelcomeOnboarding from '../components/dashboard/WelcomeOnboarding';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { getStripeConnectionStatus, updateOnboardingStepStatus } from '../utils/integrations/stripe';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DataStatusBanner from '../components/dashboard/DataStatusBanner';
import StripeSync from '../components/dashboard/StripeSync';
import DataRefresh from '../components/dashboard/DataRefresh';

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  // Data refresh utility
  const { handleRefreshData } = DataRefresh({
    userId: user?.id || '',
    isRefreshing,
    setIsRefreshing,
    onLastSyncTimeUpdate: () => getLastSyncTime(user?.id || '')
  });

  useEffect(() => {
    if (user) {
      // Check if the user has imported any data
      checkUserData(user.id);
      // Get the last sync time
      getLastSyncTime(user.id);
    }
  }, [user]);
  
  const checkUserData = async (userId: string) => {
    try {
      // Check if user has any customer or subscription data
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      
      if (customerError) throw customerError;
      
      // Check if user has connected Stripe
      const stripeStatus = await getStripeConnectionStatus(userId);
      
      // Set has data based on customers or Stripe connection
      setHasData((customerData && customerData.length > 0) || stripeStatus.connected);
      
      // If Stripe is connected, mark the connect_data step as completed
      if (stripeStatus.connected) {
        await updateOnboardingStepStatus(userId, 'connect_data', true);
      }
    } catch (error) {
      console.error('Error checking user data:', error);
      setHasData(false);
    }
  };
  
  const getLastSyncTime = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('stripe_connections')
        .select('last_sync_at')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') {
          throw error;
        }
        return;
      }
      
      if (data?.last_sync_at) {
        setLastSyncTime(data.last_sync_at);
      }
    } catch (error) {
      console.error('Error getting last sync time:', error);
    }
  };
  
  return (
    <div>
      {/* Dashboard Header */}
      <DashboardHeader 
        profile={profile}
        lastSyncTime={hasData ? lastSyncTime : null}
        isRefreshing={isRefreshing}
        onRefreshData={handleRefreshData}
      />
      
      {/* Data Connection Banner */}
      <DataStatusBanner hasData={hasData} />
      
      {/* Onboarding Widget */}
      <WelcomeOnboarding />
      
      {/* Dashboard Overview */}
      <DashboardOverview />
      
      {/* Handle Stripe Sync & Step Completion */}
      {user && (
        <StripeSync
          userId={user.id}
          onSyncStart={() => setIsRefreshing(true)}
          onSyncComplete={() => setIsRefreshing(false)}
          onCheckUserData={() => checkUserData(user.id)}
          onUpdateLastSyncTime={() => getLastSyncTime(user.id)}
        />
      )}
    </div>
  );
}
