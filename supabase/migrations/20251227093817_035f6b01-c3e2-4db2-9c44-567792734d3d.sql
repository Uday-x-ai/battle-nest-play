-- Drop the existing restrictive INSERT policies
DROP POLICY IF EXISTS "Admins can insert wallet transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "System can insert transactions" ON public.wallet_transactions;

-- Recreate as PERMISSIVE policies (either one passing allows the insert)
CREATE POLICY "Admins can insert wallet transactions"
ON public.wallet_transactions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own transactions"
ON public.wallet_transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);