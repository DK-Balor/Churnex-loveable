
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { handleCheckoutSuccess, CheckoutError } from '../../utils/stripe';
import { CheckoutMessage } from './types';

/**
 * Hook to handle successful checkout verification
 */
export const useCheckoutSuccess = (
  sessionId: string | null,
  isLoading: boolean,
  setIsLoading: (loading: boolean) => void,
  setMessage: (message: CheckoutMessage | null) => void
) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Handle checkout success
    const processCheckoutSuccess = async () => {
      if (sessionId && user) {
        setIsLoading(true);
        try {
          const result = await handleCheckoutSuccess(sessionId, user.id);
          if (result.success) {
            const planName = result.plan ? result.plan.charAt(0).toUpperCase() + result.plan.slice(1) : '';
            
            setMessage({
              type: 'success',
              text: `Successfully subscribed to the ${planName} plan! Redirecting to dashboard...`
            });
            
            toast({
              title: "Subscription activated",
              description: `You have successfully subscribed to the ${planName} plan.`,
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
          
          let errorMessage = 'There was an error processing your subscription. Please try again or contact support.';
          
          // Extract more specific error messages from CheckoutError
          if (error instanceof CheckoutError) {
            errorMessage = error.message;
          }
          
          setMessage({
            type: 'error',
            text: errorMessage
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
  }, [sessionId, user, toast, navigate, setIsLoading, setMessage]);
};
