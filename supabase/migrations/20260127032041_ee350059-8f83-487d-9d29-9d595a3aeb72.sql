-- Fix the permissive UPDATE policy - only allow the security definer function to update
DROP POLICY IF EXISTS "System can update invite codes" ON public.head_invite_codes;

-- No direct UPDATE policy needed since we use security definer function consume_head_invite_code