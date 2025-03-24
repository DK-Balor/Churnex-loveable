
-- Add Stripe-related fields to user_metadata table
ALTER TABLE public.user_metadata 
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS subscription_plan text,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamp with time zone,
ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_payment_method text,
ADD COLUMN IF NOT EXISTS subscription_price_id text,
ADD COLUMN IF NOT EXISTS subscription_created_at timestamp with time zone;

-- Add RLS policy to allow users to read their own metadata
CREATE POLICY "Users can read their own metadata"
ON public.user_metadata
FOR SELECT
USING (auth.uid() = id);

-- Add RLS policy to allow users to update their own metadata
CREATE POLICY "Users can update their own metadata"
ON public.user_metadata
FOR UPDATE
USING (auth.uid() = id);

-- Add analytics fields
ALTER TABLE public.user_metadata
ADD COLUMN IF NOT EXISTS last_active_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0;
