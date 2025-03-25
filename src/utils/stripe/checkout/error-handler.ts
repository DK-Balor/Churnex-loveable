
import { CheckoutError } from './types';

/**
 * Creates a checkout error with appropriate message and code
 * @param message Error message
 * @param code Error code
 * @returns CheckoutError instance
 */
export const createCheckoutError = (message: string, code = 'checkout_error'): CheckoutError => {
  return new CheckoutError(message, code);
};

/**
 * Handles and wraps errors from edge functions
 * @param error The original error
 * @param functionName The name of the function where error occurred
 * @returns A properly formatted CheckoutError
 */
export const handleFunctionError = (error: any, functionName: string): CheckoutError => {
  console.error(`[${new Date().toISOString()}] Error in ${functionName}:`, error);
  
  if (error instanceof CheckoutError) {
    return error;
  }
  
  return new CheckoutError(
    error.message || `Unexpected error in ${functionName}`, 
    'unexpected_error'
  );
};
