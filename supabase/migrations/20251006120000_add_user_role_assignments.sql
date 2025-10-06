-- Create user_role_assignments table to support multiple roles per user with department and field context
CREATE TABLE public.user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  field TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, department_id, field)
);

-- Enable RLS on user_role_assignments
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_role_assignments
CREATE POLICY "Users can view their own role assignments"
  ON public.user_role_assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage role assignments"
  ON public.user_role_assignments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to check if user has a role in a department and field
CREATE OR REPLACE FUNCTION public.has_role_in_context(
  _user_id UUID,
  _role public.app_role,
  _department_id UUID DEFAULT NULL,
  _field TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_role_assignments
    WHERE user_id = _user_id
      AND role = _role
      AND (_department_id IS NULL OR department_id = _department_id)
      AND (_field IS NULL OR field = _field)
  )
$$;
