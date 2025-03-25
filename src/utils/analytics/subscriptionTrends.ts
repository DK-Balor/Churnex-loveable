
import { supabase } from '../../integrations/supabase/client';

interface SubscriptionTrend {
  date: string;
  newSubscriptions: number;
  canceledSubscriptions: number;
  netGrowth: number;
  mrr: number;
}

export const getSubscriptionTrends = async (userId: string, period: 'week' | 'month' | 'quarter' = 'month'): Promise<SubscriptionTrend[]> => {
  try {
    // Determine date range based on period
    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'quarter') {
      startDate.setMonth(startDate.getMonth() - 3);
    }

    // Fetch all subscriptions within the date range
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('id, start_date, status, canceled_at, amount')
      .eq('user_id', userId)
      .gte('start_date', startDate.toISOString());

    if (error) throw error;

    // Group by date for analysis
    const trendsByDate = new Map<string, SubscriptionTrend>();
    
    // Process each subscription
    subscriptions?.forEach(subscription => {
      // Format date as YYYY-MM-DD for grouping
      const startDateStr = new Date(subscription.start_date).toISOString().split('T')[0];
      
      // Initialize the date in our map if it doesn't exist
      if (!trendsByDate.has(startDateStr)) {
        trendsByDate.set(startDateStr, {
          date: startDateStr,
          newSubscriptions: 0,
          canceledSubscriptions: 0,
          netGrowth: 0,
          mrr: 0
        });
      }
      
      // Count new subscriptions
      const trend = trendsByDate.get(startDateStr)!;
      trend.newSubscriptions += 1;
      trend.mrr += Number(subscription.amount) || 0;
      
      // Process cancellations
      if (subscription.status === 'canceled' && subscription.canceled_at) {
        const cancelDate = new Date(subscription.canceled_at).toISOString().split('T')[0];
        
        if (!trendsByDate.has(cancelDate)) {
          trendsByDate.set(cancelDate, {
            date: cancelDate,
            newSubscriptions: 0,
            canceledSubscriptions: 0,
            netGrowth: 0,
            mrr: 0
          });
        }
        
        const cancelTrend = trendsByDate.get(cancelDate)!;
        cancelTrend.canceledSubscriptions += 1;
        cancelTrend.mrr -= Number(subscription.amount) || 0;
      }
    });
    
    // Calculate net growth
    for (const trend of trendsByDate.values()) {
      trend.netGrowth = trend.newSubscriptions - trend.canceledSubscriptions;
    }
    
    // Convert map to array and sort by date
    const trendsArray = Array.from(trendsByDate.values());
    trendsArray.sort((a, b) => a.date.localeCompare(b.date));
    
    return trendsArray;
  } catch (error) {
    console.error('Error fetching subscription trends:', error);
    return [];
  }
};

export const calculateChurnRate = async (userId: string): Promise<number> => {
  try {
    // Get total active subscriptions
    const { count: activeCount, error: activeError } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');
    
    if (activeError) throw activeError;
    
    // Get canceled subscriptions in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: churnedCount, error: churnedError } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'canceled')
      .gte('canceled_at', thirtyDaysAgo.toISOString());
    
    if (churnedError) throw churnedError;
    
    // Calculate churn rate
    const totalSubscriptions = (activeCount || 0) + (churnedCount || 0);
    if (totalSubscriptions === 0) return 0;
    
    return ((churnedCount || 0) / totalSubscriptions) * 100;
  } catch (error) {
    console.error('Error calculating churn rate:', error);
    return 0;
  }
};

export const saveAnalyticsSnapshot = async (userId: string) => {
  try {
    // Calculate key metrics
    const churnRate = await calculateChurnRate(userId);
    
    const { count: activeSubscriptions, error: activeError } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');
    
    if (activeError) throw activeError;
    
    // Calculate at-risk MRR
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: atRiskSubs, error: atRiskError } = await supabase
      .from('subscriptions')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'active')
      .eq('cancel_at_period_end', true);
    
    if (atRiskError) throw atRiskError;
    
    const atRiskMrr = atRiskSubs?.reduce((sum, sub) => sum + (Number(sub.amount) || 0), 0) || 0;
    
    // Simplified recovery metrics (in a real app, these would come from actual recovery data)
    const recoveryRate = 25; // 25% recovery rate assumption
    const revenueRecovered = atRiskMrr * (recoveryRate / 100);
    
    // Save the analytics snapshot
    const today = new Date().toISOString().split('T')[0];
    
    // First check if we already have a record for today
    const { data: existingRecord, error: existingError } = await supabase
      .from('analytics_history')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    
    if (existingError && existingError.code !== 'PGRST116') throw existingError;
    
    if (existingRecord) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('analytics_history')
        .update({
          active_subscriptions: activeSubscriptions || 0,
          at_risk_revenue: atRiskMrr,
          recovery_rate: recoveryRate,
          revenue_recovered: revenueRecovered
        })
        .eq('id', existingRecord.id);
      
      if (updateError) throw updateError;
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('analytics_history')
        .insert({
          user_id: userId,
          date: today,
          active_subscriptions: activeSubscriptions || 0,
          at_risk_revenue: atRiskMrr,
          recovery_rate: recoveryRate,
          revenue_recovered: revenueRecovered
        });
      
      if (insertError) throw insertError;
    }
    
    // Update the main analytics record
    const { error: mainUpdateError } = await supabase
      .from('analytics')
      .upsert({
        user_id: userId,
        active_subscriptions: activeSubscriptions || 0,
        at_risk_revenue: atRiskMrr,
        recovery_rate: recoveryRate,
        revenue_recovered: revenueRecovered,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    
    if (mainUpdateError) throw mainUpdateError;
    
    return true;
  } catch (error) {
    console.error('Error saving analytics snapshot:', error);
    return false;
  }
};
