-- Create a trigger to auto-assign admin role for specific emails
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the new user's email should be an admin
  IF NEW.email IN ('info@ccpq.co.za', 'mosesj02@gmail.com') THEN
    -- Update the role to admin (the handle_new_user trigger already created a student role)
    UPDATE public.user_roles 
    SET role = 'admin'
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger that runs after handle_new_user
CREATE OR REPLACE TRIGGER assign_admin_role_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_admin_role();