
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createErrorResponse } from "../_shared/error.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get user ID from request
    const { userId } = await req.json();
    
    if (!userId) {
      return createErrorResponse("Missing user ID", null, 400);
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return createErrorResponse("Missing Supabase credentials", null, 500);
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Calculate analytics
    const analytics = await calculateAnalytics(supabase, userId);
    
    // Store analytics in the database
    await storeAnalytics(supabase, userId, analytics);
    
    // Return the analytics data
    return new Response(
      JSON.stringify({ success: true, data: analytics }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error calculating analytics:", error);
    return createErrorResponse(
      "Failed to calculate analytics",
      error.message,
      500
    );
  }
});

async function calculateAnalytics(supabase, userId) {
  // Get active subscriptions
  const { count: activeCount, error: activeError } = await supabase
    .from('subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active');
  
  if (activeError) throw activeError;
  
  // Get subscriptions that are at risk (will end soon)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const { data: atRiskSubs, error: atRiskError } = await supabase
    .from('subscriptions')
    .select('amount, current_period_end')
    .eq('user_id', userId)
    .eq('status', 'active')
    .or(`cancel_at_period_end.eq.true,current_period_end.lte.${thirtyDaysFromNow.toISOString()}`);
  
  if (atRiskError) throw atRiskError;
  
  // Calculate at-risk MRR
  const atRiskMrr = atRiskSubs?.reduce((sum, sub) => sum + (Number(sub.amount) || 0), 0) || 0;
  
  // Get recently canceled subscriptions
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: recentCancellations, error: cancelError } = await supabase
    .from('subscriptions')
    .select('id, amount, customer_id')
    .eq('user_id', userId)
    .eq('status', 'canceled')
    .gte('canceled_at', thirtyDaysAgo.toISOString());
  
  if (cancelError) throw cancelError;
  
  // Calculate churn rate
  const totalSubscriptionsInPeriod = (activeCount || 0) + (recentCancellations?.length || 0);
  const churnRate = totalSubscriptionsInPeriod > 0 
    ? ((recentCancellations?.length || 0) / totalSubscriptionsInPeriod) * 100 
    : 0;
  
  // For this demo, we're assuming some recovery metrics
  // In a real app, these would come from actual recovery campaigns
  const recoveryRate = 25; // Assume 25% recovery rate
  const revenueRecovered = (atRiskMrr * recoveryRate) / 100;
  
  return {
    active_subscriptions: activeCount || 0,
    at_risk_revenue: atRiskMrr,
    recovery_rate: recoveryRate,
    revenue_recovered: revenueRecovered,
    churn_rate: churnRate
  };
}

async function storeAnalytics(supabase, userId, analytics) {
  // Store in analytics table
  const { error: analyticsError } = await supabase
    .from('analytics')
    .upsert({
      user_id: userId,
      ...analytics,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  
  if (analyticsError) throw analyticsError;
  
  // Add to analytics history
  const today = new Date().toISOString().split('T')[0];
  
  const { error: historyError } = await supabase
    .from('analytics_history')
    .upsert({
      user_id: userId,
      date: today,
      ...analytics,
      created_at: new Date().toISOString()
    }, { onConflict: 'user_id,date' });
  
  if (historyError) throw historyError;
  
  return true;
}
