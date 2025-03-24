export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      analytics: {
        Row: {
          active_subscriptions: number | null
          at_risk_revenue: number | null
          created_at: string | null
          id: number
          recovery_rate: number | null
          revenue_recovered: number | null
        }
        Insert: {
          active_subscriptions?: number | null
          at_risk_revenue?: number | null
          created_at?: string | null
          id?: number
          recovery_rate?: number | null
          revenue_recovered?: number | null
        }
        Update: {
          active_subscriptions?: number | null
          at_risk_revenue?: number | null
          created_at?: string | null
          id?: number
          recovery_rate?: number | null
          revenue_recovered?: number | null
        }
        Relationships: []
      }
      user_metadata: {
        Row: {
          business_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          subscription_plan: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          subscription_plan?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          subscription_plan?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_metadata_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Add types for Stripe subscriptions
export interface StripeSubscription {
  id: string;
  customer_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
  plan_id: string;
  plan_name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  trial_end: string | null;
  cancel_at: string | null;
  canceled_at: string | null;
  current_period_end: string;
  current_period_start: string;
  created_at: string;
  updated_at: string;
}

// Add types for customer profiles with Stripe customer ID
export interface CustomerProfile {
  id: string;
  user_id: string;
  email: string;
  company_name: string | null;
  industry: string | null;
  stripe_customer_id: string | null;
  subscription_status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'none';
  subscription_plan: 'growth' | 'scale' | 'pro' | 'none';
  subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

// Add types for at-risk customers
export interface AtRiskCustomer {
  id: string;
  customer_id: string;
  risk_score: number;
  risk_factors: string[];
  predicted_churn_date: string | null;
  mrr_at_risk: number;
  created_at: string;
  updated_at: string;
}

// Add types for revenue recovery campaigns
export interface RecoveryCampaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  target_segment: 'past_due' | 'at_risk' | 'canceled';
  customers_count: number;
  message_template: string;
  incentive_type: string | null;
  incentive_value: number | null;
  recovery_goal: number;
  recovery_achieved: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}
