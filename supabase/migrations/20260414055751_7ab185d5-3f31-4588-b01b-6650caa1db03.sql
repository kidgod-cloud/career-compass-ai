
CREATE TABLE public.job_fit_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_posting TEXT NOT NULL,
  grade TEXT NOT NULL,
  score INTEGER NOT NULL,
  summary TEXT NOT NULL,
  dimensions JSONB NOT NULL DEFAULT '[]'::jsonb,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  interview_tips JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.job_fit_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own evaluations"
  ON public.job_fit_evaluations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own evaluations"
  ON public.job_fit_evaluations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own evaluations"
  ON public.job_fit_evaluations FOR DELETE
  USING (auth.uid() = user_id);
