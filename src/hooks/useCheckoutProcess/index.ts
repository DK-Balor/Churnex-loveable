
import { useState } from 'react';
import { usePlans } from './usePlans';
import { useCheckoutSession } from './useCheckoutSession';
import { useQueryParams } from './useQueryParams';
import { useCheckoutSuccess } from './useCheckoutSuccess';
import { UseCheckoutProcessReturn } from './types';

/**
 * Main hook that orchestrates the checkout process
 */
export const useCheckoutProcess = (): UseCheckoutProcessReturn => {
  const { plans, selectedPlan, handleSelectPlan } = usePlans();
  const { isLoading, message, setMessage, handleCheckout: initiateCheckout } = useCheckoutSession();
  const { sessionId } = useQueryParams(setMessage);
  const [isProcessing, setIsProcessing] = useState(isLoading);

  // Handle checkout success verification
  useCheckoutSuccess(
    sessionId,
    isProcessing,
    setIsProcessing,
    setMessage
  );

  // Combine loading states
  const combinedIsLoading = isLoading || isProcessing;

  const handleCheckout = async () => {
    await initiateCheckout(selectedPlan);
  };

  return {
    plans,
    selectedPlan,
    isLoading: combinedIsLoading,
    message,
    handleSelectPlan,
    handleCheckout
  };
};

// Re-export types for use in components
export * from './types';
