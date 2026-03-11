-- Enable Row Level Security for the interaction_logs table
ALTER TABLE public.interaction_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT interaction logs (telemetry)
CREATE POLICY "Allow public insert to interaction_logs" 
ON public.interaction_logs 
FOR INSERT 
WITH CHECK (true);

-- Allow only authenticated users (Admins) to SELECT interaction logs
CREATE POLICY "Allow authenticated full access to interaction_logs" 
ON public.interaction_logs 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create index on the created_at column for analytics performance
CREATE INDEX IF NOT EXISTS idx_interaction_logs_created_at ON public.interaction_logs (created_at);
-- Create index on product_id for product-specific analytics
CREATE INDEX IF NOT EXISTS idx_interaction_logs_product_id ON public.interaction_logs (product_id);
-- Create index on interaction_type
CREATE INDEX IF NOT EXISTS idx_interaction_logs_type ON public.interaction_logs (interaction_type);
