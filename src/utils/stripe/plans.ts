
import { supabase } from '../../integrations/supabase/client';

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
}

// Function to get the Stripe subscription plans
export const getSubscriptionPlans = async (): Promise<Plan[]> => {
  return [
    {
      id: 'price_growth', // These IDs must match the lookup_key in Stripe
      name: 'Growth',
      price: 49,
      currency: 'gbp',
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
      id: 'price_scale', // These IDs must match the lookup_key in Stripe
      name: 'Scale',
      price: 99,
      currency: 'gbp',
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
      id: 'price_pro', // These IDs must match the lookup_key in Stripe
      name: 'Pro',
      price: 199,
      currency: 'gbp',
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
