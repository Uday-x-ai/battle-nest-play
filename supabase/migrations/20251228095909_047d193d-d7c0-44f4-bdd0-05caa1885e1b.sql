-- Add unique constraint on game_id to prevent duplicate registrations
ALTER TABLE public.profiles ADD CONSTRAINT profiles_game_id_unique UNIQUE (game_id);