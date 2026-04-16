-- 1. Create the Nexus Cards Table
CREATE TABLE IF NOT EXISTS public.nexus_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID DEFAULT auth.uid() NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    last4 TEXT NOT NULL,
    expiry TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.nexus_cards ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Policy: Users can only see their own cards
DROP POLICY IF EXISTS "Users can view own cards" ON public.nexus_cards;
CREATE POLICY "Users can view own cards" 
ON public.nexus_cards 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can only add their own cards
DROP POLICY IF EXISTS "Users can insert own cards" ON public.nexus_cards;
CREATE POLICY "Users can insert own cards" 
ON public.nexus_cards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own cards
DROP POLICY IF EXISTS "Users can delete own cards" ON public.nexus_cards;
CREATE POLICY "Users can delete own cards" 
ON public.nexus_cards 
FOR DELETE 
USING (auth.uid() = user_id);


-- 4. Create an Index for performance
CREATE INDEX IF NOT EXISTS idx_nexus_cards_user ON public.nexus_cards(user_id);

-- 5. Add a reference to subscriptions (Run this to link them)
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS nexus_card_id UUID REFERENCES public.nexus_cards(id) ON DELETE SET NULL;

