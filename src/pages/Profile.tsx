import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass, User, Save, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";

import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { ResumeUpload, ParsedResume } from "@/components/ResumeUpload";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoSection } from "@/components/profile/BasicInfoSection";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { ExperienceSection } from "@/components/profile/ExperienceSection";
import { CertificationsSection } from "@/components/profile/CertificationsSection";
import { Progress } from "@/components/ui/progress";

export default function Profile() {
  const [saving, setSaving] = useState(false);
  const { profile, setProfile, loading, userId } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!loading && !userId) {
    navigate("/auth");
    return null;
  }

  const handleResumeParsed = (data: ParsedResume) => {
    setProfile(prev => ({
      ...prev,
      full_name: data.full_name || prev.full_name,
      job_title: data.job_title || prev.job_title,
      target_job: data.target_job || prev.target_job,
      industry: data.industry || prev.industry,
      experience_years: data.experience_years ?? prev.experience_years,
      skills: data.skills?.length ? data.skills : prev.skills,
      work_experience: data.work_experience?.length ? data.work_experience : prev.work_experience,
      education: data.education?.length ? data.education : prev.education,
      certifications: data.certifications?.length ? data.certifications : prev.certifications,
      resume_text: data.resume_text || prev.resume_text,
    }));
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        user_id: userId,
        full_name: profile.full_name,
        job_title: profile.job_title,
        target_job: profile.target_job,
        industry: profile.industry,
        experience_years: profile.experience_years,
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: "user_id",
      });

    if (!error) {
      await supabase
        .from("profiles")
        .update({
          skills: profile.skills,
          work_experience: profile.work_experience,
          education: profile.education,
          certifications: profile.certifications,
          resume_text: profile.resume_text,
        } as any)
        .eq("user_id", userId);
    }

    setSaving(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "저장 실패",
        description: "프로필을 저장하는 중 오류가 발생했습니다.",
      });
      return;
    }

    toast({
      title: "저장 완료",
      description: "프로필이 성공적으로 저장되었습니다.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link to="/" className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Compass className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl text-foreground">
                  Career<span className="text-gradient">Shift</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10">
              <User className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">프로필 설정</h1>
          </div>
          <p className="text-muted-foreground">
            경력 정보를 입력하면 더 정확한 AI 분석을 받을 수 있습니다.
          </p>
        </div>

        {/* Resume Upload */}
        <div className="mb-6">
          <Label className="mb-2 block text-base font-medium">이력서로 자동 입력</Label>
          <ResumeUpload onParsed={handleResumeParsed} />
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic" className="gap-1.5">
                기본 정보
                {(profile.full_name && profile.job_title) && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </TabsTrigger>
              <TabsTrigger value="skills" className="gap-1.5">
                기술 스택
                {profile.skills.length > 0 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </TabsTrigger>
              <TabsTrigger value="experience" className="gap-1.5">
                경력 · 학력
                {(profile.work_experience.length > 0 || profile.education.length > 0) && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </TabsTrigger>
              <TabsTrigger value="certs" className="gap-1.5">
                자격증
                {profile.certifications.length > 0 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-0">
              <BasicInfoSection profile={profile} setProfile={setProfile} />
            </TabsContent>

            <TabsContent value="skills" className="space-y-6 mt-0">
              <SkillsSection profile={profile} setProfile={setProfile} />
            </TabsContent>

            <TabsContent value="experience" className="space-y-6 mt-0">
              <ExperienceSection profile={profile} setProfile={setProfile} />
            </TabsContent>

            <TabsContent value="certs" className="space-y-6 mt-0">
              <CertificationsSection profile={profile} setProfile={setProfile} />
            </TabsContent>
          </Tabs>

          <Button
            className="w-full mt-6"
            size="lg"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                프로필 저장
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
