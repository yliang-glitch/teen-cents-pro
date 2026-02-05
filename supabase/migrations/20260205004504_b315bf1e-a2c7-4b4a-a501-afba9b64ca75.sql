-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

-- Allow authenticated users to upload receipts
CREATE POLICY "Users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own receipts
CREATE POLICY "Users can view their own receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own receipts
CREATE POLICY "Users can delete their own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create split_expenses table for tracking group purchases
CREATE TABLE public.split_expenses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    total_amount NUMERIC NOT NULL,
    category TEXT NOT NULL DEFAULT 'Shopping',
    receipt_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create split_participants table for tracking each person's share
CREATE TABLE public.split_participants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    split_expense_id UUID NOT NULL REFERENCES public.split_expenses(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.split_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for split_expenses
CREATE POLICY "Users can view their own split expenses"
ON public.split_expenses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own split expenses"
ON public.split_expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own split expenses"
ON public.split_expenses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own split expenses"
ON public.split_expenses FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for split_participants (access through parent split_expense)
CREATE POLICY "Users can view participants of their splits"
ON public.split_participants FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.split_expenses 
    WHERE id = split_expense_id AND user_id = auth.uid()
));

CREATE POLICY "Users can add participants to their splits"
ON public.split_participants FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.split_expenses 
    WHERE id = split_expense_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update participants of their splits"
ON public.split_participants FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM public.split_expenses 
    WHERE id = split_expense_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete participants of their splits"
ON public.split_participants FOR DELETE
USING (EXISTS (
    SELECT 1 FROM public.split_expenses 
    WHERE id = split_expense_id AND user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_split_expenses_updated_at
BEFORE UPDATE ON public.split_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();