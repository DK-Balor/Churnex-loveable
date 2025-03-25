
/**
 * Logs a checkout-related event with timestamp
 * @param context Context description for the log
 * @param data Data to log
 */
export const logCheckoutEvent = (context: string, data?: any): void => {
  console.log(`[${new Date().toISOString()}] ${context}`, data ? data : '');
};

/**
 * Logs a checkout-related error with timestamp
 * @param context Context description for the error
 * @param error Error to log
 */
export const logCheckoutError = (context: string, error: any): void => {
  console.error(`[${new Date().toISOString()}] ${context}:`, error);
};
