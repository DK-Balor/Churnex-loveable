
import React, { useEffect, useState } from 'react';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import WelcomeOnboarding from '../components/dashboard/WelcomeOnboarding';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Database, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { calculateAnalytics, syncStripeData } from '../utils/integrations/stripe';
import { useToast } from '../components/ui/use-toast';

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
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
      const { data: stripeData, error: stripeError } = await supabase
        .from('stripe_connections')
        .select('connected')
        .eq('user_id', userId)
        .eq('connected', true)
        .limit(1);
      
      if (stripeError) throw stripeError;
      
      // Set has data based on customers or Stripe connection
      setHasData((customerData && customerData.length > 0) || (stripeData && stripeData.length > 0));
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
  
  const handleRefreshData = async () => {
    if (!user || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Check if user has Stripe connected
      const { data: stripeData, error: stripeError } = await supabase
        .from('stripe_connections')
        .select('connected, account_id')
        .eq('user_id', user.id)
        .eq('connected', true)
        .single();
      
      if (stripeError && stripeError.code !== 'PGRST116') throw stripeError;
      
      if (stripeData?.connected) {
        // Sync Stripe data
        await syncStripeData(user.id);
        toast({
          title: "Data Refreshed",
          description: "Your Stripe data has been synced and analytics updated.",
        });
      } else {
        // Just calculate analytics from existing data
        await calculateAnalytics(user.id);
        toast({
          title: "Analytics Refreshed",
          description: "Dashboard analytics have been recalculated.",
        });
      }
      
      // Update last sync time
      getLastSyncTime(user.id);
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        variant: "destructive",
        title: "Refresh Failed",
        description: "Could not refresh your data. Please try again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}! Here's an overview of your subscription recovery performance.
          </p>
        </div>
        
        {hasData && (
          <div className="flex items-center space-x-3">
            {lastSyncTime && (
              <span className="text-xs text-gray-500">
                Last updated: {new Date(lastSyncTime).toLocaleString()}
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        )}
      </div>
      
      {hasData === false && (
        <div className="mb-8 bg-blue-50 border border-blue-100 p-6 rounded-lg flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-800 mb-1">Connect Your Data</h3>
            <p className="text-blue-700">
              To get accurate churn predictions and recovery insights, connect your subscription data via Stripe or CSV import.
            </p>
          </div>
          <Link to="/integrations">
            <Button className="whitespace-nowrap">
              <Database className="h-4 w-4 mr-2" />
              Connect Data
            </Button>
          </Link>
        </div>
      )}
      
      {hasData === true && <WelcomeOnboarding />}
      <DashboardOverview />
    </div>
  );
}
