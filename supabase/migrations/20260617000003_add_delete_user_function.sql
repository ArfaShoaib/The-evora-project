-- Creates a SECURITY DEFINER function that deletes the calling user's auth record.
-- Runs with the privileges of the function owner (postgres), which has access to auth.users.
-- No service role key required — the client calls this via supabase.rpc('delete_user').

CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
