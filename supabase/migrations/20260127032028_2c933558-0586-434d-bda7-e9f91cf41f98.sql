-- Create table for head invite codes
CREATE TABLE public.head_invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  used_at timestamp with time zone,
  used_by uuid,
  is_active boolean NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.head_invite_codes ENABLE ROW LEVEL SECURITY;

-- Only heads can view and create invite codes
CREATE POLICY "Heads can view invite codes"
ON public.head_invite_codes
FOR SELECT
USING (has_role(auth.uid(), 'head'));

CREATE POLICY "Heads can create invite codes"
ON public.head_invite_codes
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'head'));

CREATE POLICY "System can update invite codes"
ON public.head_invite_codes
FOR UPDATE
USING (true);

-- Create a function to validate invite code (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.validate_head_invite_code(invite_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.head_invite_codes
    WHERE code = invite_code
      AND is_active = true
      AND used_at IS NULL
  );
END;
$$;

-- Create function to consume invite code after successful registration
CREATE OR REPLACE FUNCTION public.consume_head_invite_code(invite_code text, user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.head_invite_codes
  SET used_at = now(),
      used_by = user_uuid,
      is_active = false
  WHERE code = invite_code
    AND is_active = true
    AND used_at IS NULL;
END;
$$;

-- Insert a default invite code for initial setup (you can change this)
INSERT INTO public.head_invite_codes (code) VALUES ('PGADMIN2024');