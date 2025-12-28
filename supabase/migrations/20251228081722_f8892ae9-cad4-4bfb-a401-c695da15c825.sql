-- Drop the existing foreign key constraint
ALTER TABLE public.wallet_transactions 
DROP CONSTRAINT IF EXISTS wallet_transactions_tournament_id_fkey;

-- Re-add the foreign key with ON DELETE SET NULL
ALTER TABLE public.wallet_transactions 
ADD CONSTRAINT wallet_transactions_tournament_id_fkey 
FOREIGN KEY (tournament_id) 
REFERENCES public.tournaments(id) 
ON DELETE SET NULL;

-- Also update tournament_registrations to cascade delete
ALTER TABLE public.tournament_registrations 
DROP CONSTRAINT IF EXISTS tournament_registrations_tournament_id_fkey;

ALTER TABLE public.tournament_registrations 
ADD CONSTRAINT tournament_registrations_tournament_id_fkey 
FOREIGN KEY (tournament_id) 
REFERENCES public.tournaments(id) 
ON DELETE CASCADE;