-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for inserting new users (allows users to insert their own record)
CREATE POLICY "Users can insert their own record" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy for selecting users (allows users to read their own record)
CREATE POLICY "Users can view own record" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy for updating users (allows users to update their own record)
CREATE POLICY "Users can update own record" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy for service role to manage all users
CREATE POLICY "Service role can manage all users" ON public.users
    USING (auth.role() = 'service_role');

-- Grant necessary permissions to authenticated users
GRANT INSERT, SELECT, UPDATE ON public.users TO authenticated;
GRANT USAGE ON SEQUENCE public.users_id_seq TO authenticated;