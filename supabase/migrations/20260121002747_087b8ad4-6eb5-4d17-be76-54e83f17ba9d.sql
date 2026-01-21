-- Create content_strategies table
CREATE TABLE public.content_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_audience TEXT NOT NULL,
  industry TEXT,
  expertise TEXT,
  goals TEXT,
  tone TEXT,
  frequency TEXT,
  strategy JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for content_strategies
ALTER TABLE public.content_strategies ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_strategies
CREATE POLICY "Users can view their own content strategies"
  ON public.content_strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content strategies"
  ON public.content_strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content strategies"
  ON public.content_strategies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content strategies"
  ON public.content_strategies FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for content_strategies
CREATE TRIGGER update_content_strategies_updated_at
  BEFORE UPDATE ON public.content_strategies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create networking_strategies table
CREATE TABLE public.networking_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_job TEXT NOT NULL,
  target_job TEXT,
  industry TEXT,
  goals TEXT,
  networking_style TEXT,
  target_contacts TEXT,
  strategy JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for networking_strategies
ALTER TABLE public.networking_strategies ENABLE ROW LEVEL SECURITY;

-- RLS policies for networking_strategies
CREATE POLICY "Users can view their own networking strategies"
  ON public.networking_strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own networking strategies"
  ON public.networking_strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own networking strategies"
  ON public.networking_strategies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own networking strategies"
  ON public.networking_strategies FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for networking_strategies
CREATE TRIGGER update_networking_strategies_updated_at
  BEFORE UPDATE ON public.networking_strategies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();