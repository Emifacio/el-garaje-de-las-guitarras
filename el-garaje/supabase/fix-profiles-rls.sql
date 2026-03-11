-- Enable Row Level Security for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to start fresh
DROP POLICY IF EXISTS "Profiles - select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles - insert own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles - update own" ON public.profiles;

-- Allow authenticated users to SELECT their own profile
CREATE POLICY "Profiles - select own" ON public.profiles 
FOR SELECT TO authenticated 
USING (auth.uid() = id);

-- Allow authenticated users to INSERT their own profile
CREATE POLICY "Profiles - insert own" ON public.profiles 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = id);

-- Allow authenticated users to UPDATE their own profile
CREATE POLICY "Profiles - update own" ON public.profiles 
FOR UPDATE TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Create index on the ID column for policy performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles (id);
