
import { supabase } from '../../../integrations/supabase/client';
import { CheckoutError } from './types';
import { logCheckoutEvent, logCheckoutError } from './logger';

/**
 * Invoke an Edge Function and handle standard error responses
 * @param functionName Name of the Edge Function to invoke
 * @param payload Request payload
 * @returns The response data
 */
export const invokeEdgeFunction = async <T>(functionName: string, payload: any): Promise<T> => {
  logCheckoutEvent(`Invoking ${functionName} function with payload:`, payload);
  
  try {
    logCheckoutEvent(`Calling supabase.functions.invoke('${functionName}')`);
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    });
    
    logCheckoutEvent(`${functionName} response:`, { data, error });
    
    if (error) {
      logCheckoutError(`${functionName} function error:`, error);
      throw new CheckoutError(
        `Error invoking ${functionName}: ${error.message}`, 
        'edge_function_error'
      );
    }
    
    if (!data) {
      logCheckoutError(`No data returned from ${functionName}`, null);
      throw new CheckoutError(
        `No data returned from ${functionName}`, 
        'no_data_returned'
      );
    }
    
    if (data.error) {
      logCheckoutError(`${functionName} returned error:`, data.error);
      throw new CheckoutError(
        data.error, 
        data.code || 'edge_function_error'
      );
    }
    
    return data as T;
  } catch (error) {
    logCheckoutError(`Error in invokeEdgeFunction:`, error);
    
    if (error instanceof CheckoutError) {
      throw error;
    }
    
    throw new CheckoutError(
      error.message || `Unexpected error in ${functionName}`, 
      'unexpected_error'
    );
  }
};
