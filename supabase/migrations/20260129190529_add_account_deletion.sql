-- Account deletion function with password verification
-- Required for Apple App Store compliance (section 5.1.1)

CREATE OR REPLACE FUNCTION delete_user_account(password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  current_user_id uuid;
  stored_password text;
BEGIN
  -- Get the current user
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify password using crypt function (pgcrypto)
  SELECT encrypted_password INTO stored_password
  FROM auth.users
  WHERE id = current_user_id;

  IF stored_password IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Use crypt to verify password
  IF NOT (stored_password = crypt(password, stored_password)) THEN
    RAISE EXCEPTION 'Incorrect password';
  END IF;

  -- Delete all user data (cascades to projects, tasks, time_entries)
  DELETE FROM clients WHERE clients.user_id = current_user_id;

  -- Delete the auth user
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(text) TO authenticated;
