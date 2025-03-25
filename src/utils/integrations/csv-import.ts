
import { supabase } from '../../integrations/supabase/client';
import Papa from 'papaparse';

export interface SubscriptionData {
  customer_id: string;
  customer_email?: string;
  customer_name?: string;
  plan_name: string;
  amount: number;
  currency?: string;
  start_date: string;
  end_date?: string;
  status: string;
  payment_method?: string;
  trial_end?: string;
}

export const parseCSVData = (file: File): Promise<SubscriptionData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parse error: ${results.errors[0].message}`));
          return;
        }
        
        try {
          // Validate the parsed data has the required fields
          const data = results.data as Record<string, string>[];
          const requiredFields = ['customer_id', 'plan_name', 'amount', 'start_date', 'status'];
          
          // Check first row to see if it has all required fields
          const firstRow = data[0];
          const missingFields = requiredFields.filter(field => !firstRow || !Object.keys(firstRow).includes(field));
          
          if (missingFields.length > 0) {
            reject(new Error(`CSV is missing required fields: ${missingFields.join(', ')}`));
            return;
          }
          
          // Transform data to ensure proper types
          const subscriptionData: SubscriptionData[] = data.map(row => ({
            customer_id: row.customer_id,
            customer_email: row.customer_email,
            customer_name: row.customer_name,
            plan_name: row.plan_name,
            amount: parseFloat(row.amount),
            currency: row.currency || 'USD',
            start_date: row.start_date,
            end_date: row.end_date,
            status: row.status,
            payment_method: row.payment_method,
            trial_end: row.trial_end
          }));
          
          resolve(subscriptionData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const uploadSubscriptionData = async (userId: string, data: SubscriptionData[]) => {
  try {
    // Use a background task for larger datasets
    const { data: result, error } = await supabase.functions.invoke('import-csv-data', {
      body: { 
        userId,
        subscriptions: data 
      }
    });
    
    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error uploading subscription data:', error);
    throw error;
  }
};

export const getImportHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('data_imports')
      .select('id, source, record_count, created_at, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching import history:', error);
    throw error;
  }
};
