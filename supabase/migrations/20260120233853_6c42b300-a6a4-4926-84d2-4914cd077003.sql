-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for personal branding strategies
CREATE TABLE public.personal_branding_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_title TEXT NOT NULL,
  target_role TEXT,
  industry TEXT,
  strengths TEXT[],
  core_values TEXT[],
  unique_experiences TEXT,
  target_audience TEXT,
  strategy JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.personal_branding_strategies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own branding strategies"
ON public.personal_branding_strategies
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own branding strategies"
ON public.personal_branding_strategies
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own branding strategies"
ON public.personal_branding_strategies
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own branding strategies"
ON public.personal_branding_strategies
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_personal_branding_strategies_updated_at
BEFORE UPDATE ON public.personal_branding_strategies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();