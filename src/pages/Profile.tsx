import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Compass, User, Save, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  full_name: string;
  job_title: string;
  target_job: string;
  industry: string;
  experience_years: number | null;
}

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    job_title: "",
    target_job: "",
    industry: "",
    experience_years: null,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      // Load existing profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading profile:", error);
        toast({
          variant: "destructive",
          title: "오류",
          description: "프로필을 불러오는 중 오류가 발생했습니다.",
        });
      }

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          job_title: data.job_title || "",
          target_job: data.target_job || "",
          industry: data.industry || "",
          experience_years: data.experience_years,
        });
      } else {
        // Use user metadata as fallback
        setProfile(prev => ({
          ...prev,
          full_name: session.user.user_metadata?.full_name || "",
        }));
      }

      setLoading(false);
    };

    checkAuthAndLoadProfile();
  }, [navigate, toast]);

  const handleSave = async () => {
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        user_id: session.user.id,
        full_name: profile.full_name,
        job_title: profile.job_title,
        target_job: profile.target_job,
        industry: profile.industry,
        experience_years: profile.experience_years,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      });

    setSaving(false);

    if (error) {
      console.error("Error saving profile:", error);
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
      {/* Header */}
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

      {/* Main content */}
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

        <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">이름</Label>
            <Input
              id="full_name"
              placeholder="홍길동"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </div>

          {/* Current Job Title */}
          <div className="space-y-2">
            <Label htmlFor="job_title">현재 직무</Label>
            <Input
              id="job_title"
              placeholder="예: 소프트웨어 엔지니어"
              value={profile.job_title}
              onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
            />
          </div>

          {/* Target Job */}
          <div className="space-y-2">
            <Label htmlFor="target_job">목표 직무</Label>
            <Input
              id="target_job"
              placeholder="예: 시니어 백엔드 개발자"
              value={profile.target_job}
              onChange={(e) => setProfile({ ...profile, target_job: e.target.value })}
            />
          </div>

          {/* Industry */}
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
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Experience Years */}
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

          {/* Save Button */}
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
