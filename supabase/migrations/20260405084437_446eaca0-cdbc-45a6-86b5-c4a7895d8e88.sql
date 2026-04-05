
DROP POLICY "Service role can insert purchases" ON public.user_purchases;

CREATE POLICY "Only service role can insert purchases"
ON public.user_purchases
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
