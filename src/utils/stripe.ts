
import { supabase } from '../integrations/supabase/client';

// Function to simulate getting the Stripe subscription plans (this would be replaced with real Stripe API calls in production)
export const getSubscriptionPlans = async () => {
  return [
    {
      id: 'price_growth',
      name: 'Growth',
      price: 59,
      currency: 'usd',
      interval: 'month',
      features: [
        'Up to 500 subscribers',
        'Basic recovery',
        'Churn prediction',
        'Email notifications',
        'Standard support'
      ]
    },
    {
      id: 'price_scale',
      name: 'Scale',
      price: 119,
      currency: 'usd',
      interval: 'month',
      features: [
        'Up to 2,000 subscribers',
        'Advanced recovery',
        'AI churn prevention',
        'Win-back campaigns',
        'Priority support'
      ]
    },
    {
      id: 'price_pro',
      name: 'Pro',
      price: 249,
      currency: 'usd',
      interval: 'month',
      features: [
        'Unlimited subscribers',
        'Enterprise features',
        'Custom retention workflows',
        'Dedicated account manager',
        '24/7 premium support'
      ]
    }
  ];
};

// Function to format currency based on the current locale and currency
export const formatCurrency = (amount: number, currency = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0
  }).format(amount);
};

// Function to get the current user's subscription
export const getCurrentSubscription = async (userId: string) => {
  try {
    // In a real implementation, we would fetch the subscription from Supabase
    // and then use the Stripe API to get more details if needed
    const { data: profile, error } = await supabase
      .from('user_metadata')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Mock a subscription object based on profile data
    // In production, this would come from a subscriptions table in Supabase
    // that would be synced with Stripe webhooks
    return {
      status: profile?.subscription_plan ? 'active' : 'none',
      plan: profile?.subscription_plan || 'none',
      currentPeriodEnd: profile?.trial_ends_at || new Date().toISOString(),
      isCanceled: false
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return {
      status: 'none',
      plan: 'none',
      currentPeriodEnd: new Date().toISOString(),
      isCanceled: false
    };
  }
};

// Function to create a checkout session (mock for now)
export const createCheckoutSession = async (priceId: string, customerId: string) => {
  // In a real implementation, this would call a Supabase Edge Function
  // that would create a Stripe checkout session and return the URL
  return {
    url: `/checkout-success?session_id=mock_session_${priceId}_${customerId}`
  };
};

// Function to handle successful checkout (mock for now)
export const handleCheckoutSuccess = async (sessionId: string, userId: string) => {
  // Extract the price ID from the mock session ID
  const priceId = sessionId.split('_')[2];
  
  // Map price ID to plan name
  let plan = 'none';
  if (priceId === 'price_growth') plan = 'growth';
  if (priceId === 'price_scale') plan = 'scale';
  if (priceId === 'price_pro') plan = 'pro';
  
  // Update the user's subscription in the database
  const { error } = await supabase
    .from('user_metadata')
    .update({
      subscription_plan: plan,
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    })
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
  
  return { success: true, plan };
};

// Function to cancel a subscription (mock for now)
export const cancelSubscription = async (userId: string) => {
  // In a real implementation, this would call a Supabase Edge Function
  // that would cancel the subscription with Stripe
  
  // Update the user's subscription in the database to mark it as canceled
  const { error } = await supabase
    .from('user_metadata')
    .update({
      subscription_plan: null
    })
    .eq('id', userId);
  
  if (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
  
  return { success: true };
};
