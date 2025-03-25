
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionData {
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

interface ImportRequest {
  userId: string;
  subscriptions: SubscriptionData[];
}

// Background process to import CSV data
const importSubscriptionData = async (
  supabase: any, 
  userId: string, 
  subscriptions: SubscriptionData[],
  importId: string
) => {
  console.log(`Starting import process for ${subscriptions.length} records`);
  
  try {
    // Track customers we've already processed
    const processedCustomers = new Set();
    
    // Process subscriptions in batches
    const batchSize = 100;
    for (let i = 0; i < subscriptions.length; i += batchSize) {
      const batch = subscriptions.slice(i, i + batchSize);
      
      // First, handle customer data
      const customerInserts = batch
        .filter(sub => !processedCustomers.has(sub.customer_id))
        .map(sub => {
          processedCustomers.add(sub.customer_id);
          return {
            id: sub.customer_id,
            user_id: userId,
            email: sub.customer_email || null,
            name: sub.customer_name || null,
            created_at: new Date().toISOString(),
            source: 'csv_import'
          };
        });
      
      if (customerInserts.length > 0) {
        const { error: customerError } = await supabase
          .from('customers')
          .upsert(customerInserts, { onConflict: 'id,user_id', ignoreDuplicates: false });
        
        if (customerError) {
          console.error('Error inserting customer data:', customerError);
        }
      }
      
      // Then, handle subscription data
      const subscriptionInserts = batch.map(sub => ({
        customer_id: sub.customer_id,
        user_id: userId,
        plan_name: sub.plan_name,
        amount: sub.amount,
        currency: sub.currency || 'USD',
        start_date: new Date(sub.start_date).toISOString(),
        end_date: sub.end_date ? new Date(sub.end_date).toISOString() : null,
        status: sub.status,
        payment_method: sub.payment_method || null,
        trial_end: sub.trial_end ? new Date(sub.trial_end).toISOString() : null,
        source: 'csv_import',
        source_id: importId
      }));
      
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert(subscriptionInserts);
      
      if (subError) {
        console.error('Error inserting subscription data:', subError);
        throw subError;
      }
      
      console.log(`Processed batch ${i/batchSize + 1} of ${Math.ceil(subscriptions.length/batchSize)}`);
    }
    
    // Update import status to completed
    await supabase
      .from('data_imports')
      .update({ 
        status: 'completed',
        record_count: subscriptions.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', importId);
    
    console.log('CSV import completed successfully');
  } catch (error) {
    console.error('Error in import process:', error);
    
    // Update import status to failed
    await supabase
      .from('data_imports')
      .update({ 
        status: 'failed',
        error_message: error.message || 'Unknown error',
        completed_at: new Date().toISOString()
      })
      .eq('id', importId);
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, subscriptions }: ImportRequest = await req.json();
    
    if (!userId || !subscriptions || !Array.isArray(subscriptions)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create an import record
    const { data: importRecord, error: importError } = await supabase
      .from('data_imports')
      .insert({
        user_id: userId,
        source: 'csv',
        status: 'processing',
        record_count: subscriptions.length
      })
      .select()
      .single();
    
    if (importError) {
      throw importError;
    }
    
    // Start background processing
    const importId = importRecord.id;
    EdgeRuntime.waitUntil(importSubscriptionData(supabase, userId, subscriptions, importId));
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Import started',
        importId,
        recordCount: subscriptions.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in import-csv-data function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
