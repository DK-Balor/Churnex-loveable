import { supabase } from '../integrations/supabase/client';

// Function to get the Stripe subscription plans
export const getSubscriptionPlans = async () => {
  return [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'usd',
      interval: 'month',
      features: [
        'Basic dashboard access',
        'View basic metrics',
        'Limited features',
        'Email support'
      ]
    },
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
    // Fetch user's subscription data from Supabase
    const { data: profile, error } = await supabase
      .from('user_metadata')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      status: profile?.subscription_plan ? 'active' : 'inactive',
      plan: profile?.subscription_plan || 'free', // Default to free plan if none is set
      currentPeriodEnd: profile?.trial_ends_at || new Date().toISOString(),
      isCanceled: false,
      isTrialing: profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date()
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return {
      status: 'inactive',
      plan: 'free', // Default to free plan
      currentPeriodEnd: new Date().toISOString(),
      isCanceled: false,
      isTrialing: false
    };
  }
};

// Function to create a checkout session
export const createCheckoutSession = async (priceId: string) => {
  try {
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { 
        priceId,
        successUrl: window.location.origin + '/checkout-success',
        cancelUrl: window.location.origin + '/checkout?canceled=true'
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Function to handle successful checkout
export const handleCheckoutSuccess = async (sessionId: string, userId: string) => {
  try {
    // With Stripe webhooks, this is handled automatically by the backend
    // This function now mainly checks the current subscription status
    const { data: profile, error } = await supabase
      .from('user_metadata')
      .select('subscription_plan')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return { 
      success: !!profile?.subscription_plan,
      plan: profile?.subscription_plan || 'free'
    };
  } catch (error) {
    console.error('Error verifying checkout:', error);
    throw error;
  }
};

// Function to cancel a subscription
export const cancelSubscription = async (userId: string) => {
  try {
    // Call our Supabase Edge Function for cancellation
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { userId }
    });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

// Function to update payment method
export const updatePaymentMethod = async (userId: string) => {
  try {
    // Call Supabase Edge Function to create a billing portal session
    const { data, error } = await supabase.functions.invoke('create-billing-portal', {
      body: { userId }
    });

    if (error) throw error;
    
    // Redirect to the billing portal
    if (data?.url) {
      window.location.href = data.url;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
};

// Function to activate a free plan
export const activateFreePlan = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('user_metadata')
      .update({
        subscription_plan: 'free'
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error activating free plan:', error);
      throw error;
    }
    
    return { success: true, plan: 'free' };
  } catch (error) {
    console.error('Error activating free plan:', error);
    throw error;
  }
};
