
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { createCheckoutSession, CheckoutError } from '../../utils/stripe';
import { CheckoutMessage } from './types';

/**
 * Hook to handle checkout session creation
 */
export const useCheckoutSession = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<CheckoutMessage | null>(null);
  
  const handleCheckout = async (selectedPlan: string | null) => {
    console.log('[CHECKOUT] Checkout initiated');
    
    if (!selectedPlan || !user) {
      console.error('[CHECKOUT] Missing plan or user', { selectedPlan, user });
      toast({
        title: "Error",
        description: "Please select a plan to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setMessage(null); // Clear any previous messages
    
    try {
      console.log('[CHECKOUT] Creating checkout session for plan:', selectedPlan);
      
      // Direct redirect to Stripe
      const { url } = await createCheckoutSession(selectedPlan);
      
      if (url) {
        console.log('[CHECKOUT] Redirecting to Stripe checkout URL:', url);
        // Redirect to Stripe Checkout
        window.location.href = url;
        return; // Important: return early to prevent further code execution
      } else {
        throw new CheckoutError('No checkout URL returned', 'no_checkout_url');
      }
    } catch (error) {
      console.error('[CHECKOUT] Error creating checkout session:', error);
      
      let errorMessage = 'There was a problem connecting to our payment service. Please try again later.';
      
      // Extract more specific error messages from CheckoutError
      if (error instanceof CheckoutError) {
        if (error.code === 'edge_function_error') {
          errorMessage = 'There was a problem connecting to our payment service. Please try again later.';
        } else if (error.code === 'no_checkout_url') {
          errorMessage = 'Unable to create a checkout session. Please try again later.';
        } else if (error.code === 'invalid_price_id') {
          errorMessage = 'Invalid subscription plan selected. Please try a different plan.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Checkout Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return { isLoading, message, setMessage, handleCheckout };
};
