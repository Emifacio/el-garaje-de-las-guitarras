-- Enable Row Level Security for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to SELECT their own profile
CREATE POLICY "Profiles - select own" ON public.profiles 
FOR SELECT TO authenticated 
USING ((SELECT auth.uid()) = id);

-- Allow authenticated users to INSERT their own profile
CREATE POLICY "Profiles - insert own" ON public.profiles 
FOR INSERT TO authenticated 
WITH CHECK ((SELECT auth.uid()) = id);

-- Allow authenticated users to UPDATE their own profile
CREATE POLICY "Profiles - update own" ON public.profiles 
FOR UPDATE TO authenticated 
USING ((SELECT auth.uid()) = id) 
WITH CHECK ((SELECT auth.uid()) = id);

-- Create index on the ID column for policy performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles (id);

-- Optional: Allow public to see basic profile info (e.g. for display names)
-- Uncomment if needed:
-- CREATE POLICY "Allow public read access to profile names" ON public.profiles FOR SELECT USING (true);
