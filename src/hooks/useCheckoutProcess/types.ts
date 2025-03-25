
import { CheckoutError } from '../../utils/stripe';

/**
 * Types and interfaces for the checkout process
 */

export interface CheckoutMessage {
  type: 'success' | 'error';
  text: string;
}

export interface UseCheckoutProcessReturn {
  plans: any[];
  selectedPlan: string | null;
  isLoading: boolean;
  message: CheckoutMessage | null;
  handleSelectPlan: (planId: string) => void;
  handleCheckout: () => Promise<void>;
}
