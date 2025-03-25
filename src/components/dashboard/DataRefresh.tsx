
import React from 'react';
import { useToast } from '../../components/ui/use-toast';
import { calculateAnalytics, syncStripeData, getStripeConnectionStatus } from '../../utils/integrations/stripe';

interface DataRefreshProps {
  userId: string;
  isRefreshing: boolean;
  setIsRefreshing: (value: boolean) => void;
  onLastSyncTimeUpdate: () => void;
}

export default function DataRefresh({ 
  userId, 
  isRefreshing, 
  setIsRefreshing, 
  onLastSyncTimeUpdate 
}: DataRefreshProps) {
  const { toast } = useToast();
  
  const handleRefreshData = async () => {
    if (!userId || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Check if user has Stripe connected
      const stripeStatus = await getStripeConnectionStatus(userId);
      
      if (stripeStatus.connected) {
        // Sync Stripe data
        await syncStripeData(userId);
        toast({
          title: "Data Refreshed",
          description: "Your Stripe data has been synced and analytics updated.",
        });
      } else {
        // Just calculate analytics from existing data
        await calculateAnalytics(userId);
        toast({
          title: "Analytics Refreshed",
          description: "Dashboard analytics have been recalculated.",
        });
      }
      
      // Update last sync time
      onLastSyncTimeUpdate();
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
  
  return { handleRefreshData };
}
