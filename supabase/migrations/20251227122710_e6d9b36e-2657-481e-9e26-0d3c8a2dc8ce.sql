-- Add slot_number column to tournament_registrations
ALTER TABLE public.tournament_registrations 
ADD COLUMN slot_number integer;

-- Add unique constraint to prevent duplicate slots per tournament
ALTER TABLE public.tournament_registrations 
ADD CONSTRAINT unique_tournament_slot UNIQUE (tournament_id, slot_number);