
-- Add account expiry fields to user_metadata
ALTER TABLE public.user_metadata 
ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'demo',
ADD COLUMN IF NOT EXISTS account_created_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS account_expires_at timestamp with time zone DEFAULT (now() + interval '30 days');

-- Create an index to make account expiry queries faster
CREATE INDEX IF NOT EXISTS idx_user_metadata_account_expires_at ON public.user_metadata(account_expires_at);
