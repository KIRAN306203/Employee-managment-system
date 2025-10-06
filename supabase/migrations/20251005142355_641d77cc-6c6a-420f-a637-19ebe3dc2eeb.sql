-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'employee');

-- Create employee_status enum
CREATE TYPE public.employee_status AS ENUM ('active', 'on_leave', 'terminated');

-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  manager_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create profiles table linked to auth
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update employees table structure
ALTER TABLE public.employees 
  ADD COLUMN user_id UUID UNIQUE,
  ADD COLUMN status public.employee_status NOT NULL DEFAULT 'active',
  ADD COLUMN avatar_url TEXT,
  ADD COLUMN bio TEXT,
  ADD COLUMN date_of_birth DATE,
  ADD COLUMN address TEXT,
  ADD COLUMN emergency_contact TEXT,
  ADD COLUMN emergency_phone TEXT;

-- Create employee_departments junction table (many-to-many)
CREATE TABLE public.employee_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, department_id)
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_departments ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'manager' THEN 2
      WHEN 'employee' THEN 3
    END
  LIMIT 1
$$;

-- RLS Policies for departments
CREATE POLICY "Everyone can view departments"
  ON public.departments FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Update employees RLS policies
DROP POLICY IF EXISTS "Allow public read access to employees" ON public.employees;
DROP POLICY IF EXISTS "Allow public insert to employees" ON public.employees;
DROP POLICY IF EXISTS "Allow public update to employees" ON public.employees;
DROP POLICY IF EXISTS "Allow public delete from employees" ON public.employees;

CREATE POLICY "Authenticated users can view employees"
  ON public.employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can insert employees"
  ON public.employees FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Admins and managers can update employees"
  ON public.employees FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Only admins can delete employees"
  ON public.employees FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for employee_departments
CREATE POLICY "Everyone can view employee departments"
  ON public.employee_departments FOR SELECT
  USING (true);

CREATE POLICY "Admins and managers can manage employee departments"
  ON public.employee_departments FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- Triggers for updated_at
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default 'employee' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add foreign key for manager_id in departments (after table creation)
ALTER TABLE public.departments
  ADD CONSTRAINT fk_manager
  FOREIGN KEY (manager_id) REFERENCES public.employees(id) ON DELETE SET NULL;

-- Insert some sample departments
INSERT INTO public.departments (name, description) VALUES
  ('Engineering', 'Software development and technical operations'),
  ('Human Resources', 'Employee management and recruitment'),
  ('Sales', 'Sales and business development'),
  ('Marketing', 'Marketing and communications'),
  ('Finance', 'Financial operations and accounting'),
  ('Operations', 'Business operations and logistics');
