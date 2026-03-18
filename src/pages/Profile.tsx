import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Compass, User, Save, Loader2, X } from "lucide-react";
import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { ResumeUpload, ParsedResume } from "@/components/ResumeUpload";
import { WorkExperienceEditor } from "@/components/profile/WorkExperienceEditor";

const industries = [
  "IT/소프트웨어",
  "금융/은행",
  "제조업",
  "의료/헬스케어",
  "교육",
  "마케팅/광고",
  "컨설팅",
  "미디어/엔터테인먼트",
  "유통/물류",
  "기타",
];

export default function Profile() {
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newCert, setNewCert] = useState("");

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (profile.skills.includes(trimmed)) {
      setNewSkill("");
      return;
    }
    setProfile(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setNewSkill("");
  };

  const handleRemoveSkill = (index: number) => {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };
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

    // Save extended fields separately to avoid type issues
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

        <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">이름</Label>
            <Input
              id="full_name"
              placeholder="홍길동"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title">현재 직무</Label>
            <Input
              id="job_title"
              placeholder="예: 소프트웨어 엔지니어"
              value={profile.job_title}
              onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_job">목표 직무</Label>
            <Input
              id="target_job"
              placeholder="예: 시니어 백엔드 개발자"
              value={profile.target_job}
              onChange={(e) => setProfile({ ...profile, target_job: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">업계</Label>
            <Select
              value={profile.industry}
              onValueChange={(value) => setProfile({ ...profile, industry: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="업계를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_years">경력 연수</Label>
            <Input
              id="experience_years"
              type="number"
              min="0"
              max="50"
              placeholder="예: 5"
              value={profile.experience_years ?? ""}
              onChange={(e) => 
                setProfile({ 
                  ...profile, 
                  experience_years: e.target.value ? parseInt(e.target.value) : null 
                })
              }
            />
          </div>

          {/* Skills editor */}
          <div className="space-y-2">
            <Label>보유 기술</Label>
            <div className="flex gap-2">
              <Input
                placeholder="기술명 입력 후 Enter 또는 추가 버튼"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button type="button" variant="outline" size="default" onClick={handleAddSkill} disabled={!newSkill.trim()}>
                추가
              </Button>
            </div>
            {profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 pr-1 cursor-pointer group">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(i)}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`${skill} 삭제`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Work experience editor */}
          <WorkExperienceEditor
            items={profile.work_experience}
            onChange={(items) => setProfile(prev => ({ ...prev, work_experience: items }))}
          />

          {/* Certifications display */}
          {profile.certifications.length > 0 && (
            <div className="space-y-2">
              <Label>자격증</Label>
              <div className="flex flex-wrap gap-2">
                {profile.certifications.map((cert, i) => (
                  <Badge key={i} variant="outline">{cert}</Badge>
                ))}
              </div>
            </div>
          )}

          <Button 
            className="w-full" 
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
