
import { useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/use-toast';
import { syncStripeData, updateOnboardingStepStatus } from '../../utils/integrations/stripe';

interface StripeSyncProps {
  userId: string;
  onSyncStart: () => void;
  onSyncComplete: () => void;
  onCheckUserData: () => void;
  onUpdateLastSyncTime: () => void;
}

export default function StripeSync({ 
  userId, 
  onSyncStart, 
  onSyncComplete, 
  onCheckUserData, 
  onUpdateLastSyncTime 
}: StripeSyncProps) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (userId) {
      // Check if the user is returning from Stripe OAuth
      const stripeSuccess = searchParams.get('stripe_success');
      const stripeError = searchParams.get('stripe_error');
      
      if (stripeSuccess === 'true') {
        // Clear the URL parameter to prevent re-processing
        window.history.replaceState({}, document.title, window.location.pathname);
        
        toast({
          title: "Stripe Connected",
          description: "Your Stripe account was successfully connected. Syncing data...",
        });
        
        // Sync the data from Stripe
        onSyncStart();
        
        syncStripeData(userId)
          .then(() => {
            // Mark the connect_data step as completed
            return updateOnboardingStepStatus(userId, 'connect_data', true);
          })
          .then(() => {
            toast({
              title: "Data Synced",
              description: "Your Stripe data has been successfully imported.",
              variant: "success",
            });
            
            // Refresh data status and last sync time
            onCheckUserData();
            onUpdateLastSyncTime();
          })
          .catch((error) => {
            console.error('Error syncing Stripe data:', error);
            toast({
              title: "Sync Failed",
              description: "There was a problem syncing your Stripe data. Please try again.",
              variant: "destructive",
            });
          })
          .finally(() => {
            onSyncComplete();
          });
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
    }
  }, [userId, searchParams, toast]);
  
  useEffect(() => {
    if (!userId) return;
    
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
        updateOnboardingStepStatus(userId, stepId, true)
          .then(() => {
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
          })
          .catch(error => {
            console.error('Error updating step status:', error);
          });
      }
    }
  }, [userId, location, toast]);
  
  return null;
}
