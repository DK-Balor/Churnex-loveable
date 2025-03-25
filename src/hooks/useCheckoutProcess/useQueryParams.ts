
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckoutMessage } from './types';

/**
 * Hook to handle URL query parameters for checkout process
 */
export const useQueryParams = (
  setMessage: (message: CheckoutMessage | null) => void
) => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const canceled = searchParams.get('cancelled');
  
  // Check for cancellation query param
  useEffect(() => {
    if (canceled) {
      setMessage({
        type: 'error',
        text: "Checkout was cancelled. Please try again when you're ready."
      });
    }
  }, [canceled, setMessage]);
  
  return { sessionId };
};
