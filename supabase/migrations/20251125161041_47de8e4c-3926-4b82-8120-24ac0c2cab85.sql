-- Add trial_start_date to profiles table
ALTER TABLE public.profiles
ADD COLUMN trial_start_date timestamp with time zone DEFAULT now();

-- Update existing users to have trial_start_date set
UPDATE public.profiles
SET trial_start_date = created_at
WHERE trial_start_date IS NULL;

-- Update the handle_new_user function to set trial_start_date
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, trial_start_date, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW(),
    NOW()
  );
  
  INSERT INTO public.user_settings (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  
  RETURN NEW;
END;
$function$;