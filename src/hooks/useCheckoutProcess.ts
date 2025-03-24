
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import { 
  getSubscriptionPlans, 
  createCheckoutSession, 
  handleCheckoutSuccess
} from '../utils/stripe';

export interface CheckoutMessage {
  type: 'success' | 'error';
  text: string;
}

export const useCheckoutProcess = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<CheckoutMessage | null>(null);

  // Check if this is a return from a checkout session or if there was a cancellation
  const sessionId = searchParams.get('session_id');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await getSubscriptionPlans();
        setPlans(plansData);
        
        // Set the default selected plan (Scale)
        const defaultPlan = plansData.find(p => p.name === 'Scale');
        if (defaultPlan) {
          setSelectedPlan(defaultPlan.id);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription plans. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    fetchPlans();

    // Show message if checkout was cancelled
    if (canceled) {
      setMessage({
        type: 'error',
        text: "Checkout was cancelled. Please try again when you're ready."
      });
    }
  }, [canceled, toast]);

  useEffect(() => {
    // Handle checkout success
    const processCheckoutSuccess = async () => {
      if (sessionId && user) {
        setIsLoading(true);
        try {
          const result = await handleCheckoutSuccess(sessionId, user.id);
          if (result.success) {
            setMessage({
              type: 'success',
              text: `Successfully subscribed to the ${result.plan.charAt(0).toUpperCase() + result.plan.slice(1)} plan! Redirecting to dashboard...`
            });
            
            toast({
              title: "Subscription activated",
              description: `You have successfully subscribed to the ${result.plan.charAt(0).toUpperCase() + result.plan.slice(1)} plan.`,
              variant: "success",
            });
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          } else {
            setMessage({
              type: 'error',
              text: 'Subscription was not found. Please contact support if you believe this is an error.'
            });
          }
        } catch (error) {
          console.error('Error processing checkout:', error);
          setMessage({
            type: 'error',
            text: 'There was an error processing your subscription. Please try again or contact support.'
          });
          
          toast({
            title: "Checkout error",
            description: "There was a problem processing your subscription.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    processCheckoutSuccess();
  }, [sessionId, user, toast, navigate]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleCheckout = async () => {
    if (!selectedPlan || !user) {
      toast({
        title: "Error",
        description: "Please select a plan to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // For paid plans, proceed with Stripe checkout
      try {
        const { url } = await createCheckoutSession(selectedPlan);
        
        if (url) {
          // Redirect to Stripe Checkout
          window.location.href = url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } catch (error: any) {
        console.error('Error creating checkout session:', error);
        
        toast({
          title: "Checkout Error",
          description: error.message || "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
        
        setMessage({
          type: 'error',
          text: error.message || 'There was an error creating your checkout session. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    plans,
    selectedPlan,
    isLoading,
    message,
    handleSelectPlan,
    handleCheckout
  };
};
