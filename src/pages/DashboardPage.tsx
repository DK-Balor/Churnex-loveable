
import React, { useEffect, useState } from 'react';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import WelcomeOnboarding from '../components/dashboard/WelcomeOnboarding';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Database, RefreshCw } from 'lucide-react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { calculateAnalytics, syncStripeData, getStripeConnectionStatus, updateOnboardingStepStatus, getOnboardingStepStatuses } from '../utils/integrations/stripe';
import { useToast } from '../components/ui/use-toast';

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      // Check if the user has imported any data
      checkUserData(user.id);
      // Get the last sync time
      getLastSyncTime(user.id);
      // Check if they came back from Stripe connection
      checkStripeRedirect();
      // Check for step completions from other pages
      checkStepCompletion();
    }
  }, [user, location]);
  
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
  
  // Check if the user is returning from Stripe OAuth
  const checkStripeRedirect = async () => {
    const stripeSuccess = searchParams.get('stripe_success');
    const stripeError = searchParams.get('stripe_error');
    
    if (stripeSuccess === 'true' && user) {
      // Clear the URL parameter to prevent re-processing
      window.history.replaceState({}, document.title, window.location.pathname);
      
      toast({
        title: "Stripe Connected",
        description: "Your Stripe account was successfully connected. Syncing data...",
      });
      
      // Sync the data from Stripe
      setIsRefreshing(true);
      try {
        await syncStripeData(user.id);
        
        // Mark the connect_data step as completed
        await updateOnboardingStepStatus(user.id, 'connect_data', true);
        
        toast({
          title: "Data Synced",
          description: "Your Stripe data has been successfully imported.",
          variant: "success",
        });
        
        // Refresh data status and last sync time
        checkUserData(user.id);
        getLastSyncTime(user.id);
      } catch (error) {
        console.error('Error syncing Stripe data:', error);
        toast({
          title: "Sync Failed",
          description: "There was a problem syncing your Stripe data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsRefreshing(false);
      }
    }
    
    if (stripeError === 'true') {
      // Clear the URL parameter to prevent re-processing
      window.history.replaceState({}, document.title, window.location.pathname);
      
      toast({
        title: "Stripe Connection Failed",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  };
  
  // Check if returning from other pages after completing steps
  const checkStepCompletion = async () => {
    if (!user) return;
    
    // Get referrer path from URL state if available
    const fromPath = location.state?.from;
    
    if (fromPath) {
      // Clear the state to prevent re-processing
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Map paths to step IDs
      const pathToStepId: {[key: string]: string} = {
        '/settings': 'profile',
        '/churn-prediction': 'explore_predictions',
        '/recovery': 'create_campaign'
      };
      
      const stepId = pathToStepId[fromPath];
      if (stepId) {
        // Mark the step as completed
        await updateOnboardingStepStatus(user.id, stepId, true);
        
        // Show success toast
        const stepNames: {[key: string]: string} = {
          'profile': 'Profile updated',
          'explore_predictions': 'Predictions explored',
          'create_campaign': 'Campaign created'
        };
        
        toast({
          title: stepNames[stepId] || 'Step completed',
          description: "You've completed another step in your onboarding!",
          variant: "success",
        });
      }
    }
  };
  
  const handleRefreshData = async () => {
    if (!user || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Check if user has Stripe connected
      const stripeStatus = await getStripeConnectionStatus(user.id);
      
      if (stripeStatus.connected) {
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
      
      <WelcomeOnboarding />
      <DashboardOverview />
    </div>
  );
}
