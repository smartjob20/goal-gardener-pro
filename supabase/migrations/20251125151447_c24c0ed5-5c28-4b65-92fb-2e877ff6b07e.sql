-- Add subscription management columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing')),
ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

-- Create index for faster subscription queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(is_pro, subscription_status);

-- RLS Policy: Users can SELECT their own subscription data
CREATE POLICY "Users can view their own subscription data"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- RLS Policy: Only service role can UPDATE subscription columns
-- This is implicitly enforced by NOT creating an UPDATE policy that allows users to modify these columns
-- The existing "Users can update their own profile" policy should be modified to exclude subscription fields

-- Drop the existing update policy if it exists
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate the update policy excluding subscription management columns
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND is_pro = (SELECT is_pro FROM public.profiles WHERE id = auth.uid())
  AND subscription_tier = (SELECT subscription_tier FROM public.profiles WHERE id = auth.uid())
  AND subscription_status = (SELECT subscription_status FROM public.profiles WHERE id = auth.uid())
  AND current_period_end IS NOT DISTINCT FROM (SELECT current_period_end FROM public.profiles WHERE id = auth.uid())
);

-- Create a function for service role to update subscription status
CREATE OR REPLACE FUNCTION public.update_subscription_status(
  _user_id uuid,
  _is_pro boolean,
  _subscription_tier text,
  _subscription_status text,
  _current_period_end timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    is_pro = _is_pro,
    subscription_tier = _subscription_tier,
    subscription_status = _subscription_status,
    current_period_end = _current_period_end,
    updated_at = NOW()
  WHERE id = _user_id;
END;
$$;