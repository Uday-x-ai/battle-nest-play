-- Allow admins to update any user's profile (for wallet operations)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert wallet transactions for any user
CREATE POLICY "Admins can insert wallet transactions"
ON public.wallet_transactions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));