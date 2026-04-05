
CREATE TABLE public.user_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_name TEXT NOT NULL,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_name)
);

ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases"
ON public.user_purchases
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert purchases"
ON public.user_purchases
FOR INSERT
WITH CHECK (true);
