-- Create maintenance_requests table
CREATE TABLE public.maintenance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  room_number TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create maintenance requests"
ON public.maintenance_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own requests or heads can view all"
ON public.maintenance_requests
FOR SELECT
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'head'::app_role));

CREATE POLICY "Heads can update requests"
ON public.maintenance_requests
FOR UPDATE
USING (has_role(auth.uid(), 'head'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_maintenance_requests_updated_at
BEFORE UPDATE ON public.maintenance_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();