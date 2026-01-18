-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('head', 'guest');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  occupation TEXT NOT NULL CHECK (occupation IN ('work', 'student')),
  work_type TEXT,
  course TEXT,
  year TEXT,
  room_number TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create laundry_bookings table
CREATE TABLE public.laundry_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  machine TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  booking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.laundry_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all bookings" ON public.laundry_bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own bookings" ON public.laundry_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.laundry_bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create packages table
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('normal', 'mid', 'premium')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('upi', 'card')),
  amount INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own packages" ON public.packages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own packages" ON public.packages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create food_polls table
CREATE TABLE public.food_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.food_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view polls" ON public.food_polls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Heads can create polls" ON public.food_polls FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'head'));
CREATE POLICY "Heads can update polls" ON public.food_polls FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'head'));

-- Create food_poll_votes table
CREATE TABLE public.food_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.food_polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  option TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id)
);

ALTER TABLE public.food_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" ON public.food_poll_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can vote" ON public.food_poll_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vote" ON public.food_poll_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create food_poll_ratings table
CREATE TABLE public.food_poll_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.food_polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id)
);

ALTER TABLE public.food_poll_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings" ON public.food_poll_ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can rate" ON public.food_poll_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rating" ON public.food_poll_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create daily_menus table
CREATE TABLE public.daily_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  breakfast JSONB,
  lunch JSONB,
  snacks JSONB,
  dinner JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menus" ON public.daily_menus FOR SELECT TO authenticated USING (true);
CREATE POLICY "Heads can create menus" ON public.daily_menus FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'head'));
CREATE POLICY "Heads can update menus" ON public.daily_menus FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'head'));

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_number TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own complaints" ON public.complaints FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'head'));
CREATE POLICY "Users can create complaints" ON public.complaints FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Heads can update complaints" ON public.complaints FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'head'));

-- Create lost_found_items table
CREATE TABLE public.lost_found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT NOT NULL,
  location_found TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'found' CHECK (status IN ('found', 'claimed')),
  claimed_by UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view items" ON public.lost_found_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can post items" ON public.lost_found_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON public.lost_found_items FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'head'));

-- Create bills table
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bill_type TEXT NOT NULL CHECK (bill_type IN ('electricity', 'water')),
  amount DECIMAL(10,2) NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bills" ON public.bills FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'head'));
CREATE POLICY "Heads can create bills" ON public.bills FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'head'));
CREATE POLICY "Heads can update bills" ON public.bills FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'head'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_daily_menus_updated_at BEFORE UPDATE ON public.daily_menus FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();