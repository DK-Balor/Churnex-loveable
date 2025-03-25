
/**
 * Type definitions for the checkout process
 */

/**
 * Error types specific to the checkout process
 */
export class CheckoutError extends Error {
  public code: string;
  
  constructor(message: string, code = 'checkout_error') {
    super(message);
    this.name = 'CheckoutError';
    this.code = code;
  }
}

/**
 * Response type for checkout session
 */
export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

/**
 * Response type for checkout success verification
 */
export interface CheckoutSuccessResponse {
  success: boolean;
  plan: string | null;
  status: string;
  accountType: string;
  isTrial: boolean;
  trialEndsAt: string | null;
  subscriptionId: string | null;
  customerId: string | null;
  currentPeriodEnd: string | null;
}
