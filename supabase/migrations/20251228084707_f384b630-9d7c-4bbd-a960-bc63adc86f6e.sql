-- Add game_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS game_id text;

-- Update the handle_new_user function to include game_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, game_name, telegram_id, game_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'game_name',
    NEW.raw_user_meta_data ->> 'telegram_id',
    NEW.raw_user_meta_data ->> 'game_id'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;