-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  position TEXT NOT NULL,
  department TEXT,
  phone TEXT,
  hire_date DATE DEFAULT CURRENT_DATE,
  salary NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (as this is a demo/hackathon project)
CREATE POLICY "Allow public read access to employees" 
ON public.employees 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to employees" 
ON public.employees 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update to employees" 
ON public.employees 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete from employees" 
ON public.employees 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster searches
CREATE INDEX idx_employees_name ON public.employees(name);
CREATE INDEX idx_employees_email ON public.employees(email);
CREATE INDEX idx_employees_department ON public.employees(department);