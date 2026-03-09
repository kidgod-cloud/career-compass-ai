import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileData {
  full_name: string;
  job_title: string;
  target_job: string;
  industry: string;
  experience_years: number | null;
  skills: string[];
  work_experience: Array<{ company: string; position: string; period: string; description: string }>;
  education: Array<{ school: string; degree: string; major: string; year: string }>;
  certifications: string[];
  resume_text: string | null;
}

const defaultProfile: ProfileData = {
  full_name: "",
  job_title: "",
  target_job: "",
  industry: "",
  experience_years: null,
  skills: [],
  work_experience: [],
  education: [],
  certifications: [],
  resume_text: null,
};

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          job_title: data.job_title || "",
          target_job: data.target_job || "",
          industry: data.industry || "",
          experience_years: data.experience_years,
          skills: (data as any).skills || [],
          work_experience: (data as any).work_experience || [],
          education: (data as any).education || [],
          certifications: (data as any).certifications || [],
          resume_text: (data as any).resume_text || null,
        });
      } else {
        setProfile(prev => ({
          ...prev,
          full_name: session.user.user_metadata?.full_name || "",
        }));
      }

      setLoading(false);
    };

    load();
  }, []);

  return { profile, setProfile, loading, userId };
}
