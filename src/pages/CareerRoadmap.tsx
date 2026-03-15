import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Compass,
  ArrowLeft,
  Loader2,
  Brain,
  Target,
  CheckCircle2,
  BookOpen,
  AlertTriangle,
  Trophy,
  ChevronDown,
  ChevronUp,
  Save,
  Circle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface Milestone {
  month: number;
  title: string;
  goals: string[];
  actions: string[];
  skills: string[];
  resources: string[];
  completed?: boolean;
}

interface Roadmap {
  title: string;
  summary: string;
  milestones: Milestone[];
  keySkills: string[];
  potentialChallenges: string[];
  successMetrics: string[];
  rawContent?: string;
  parseError?: boolean;
}

export default function CareerRoadmap() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentJob, setCurrentJob] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [industry, setIndustry] = useState("");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const { profile } = useProfile();
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [roadmapId, setRoadmapId] = useState<string | null>(null);
  const [updatingMilestone, setUpdatingMilestone] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (profile.job_title && !currentJob) setCurrentJob(profile.job_title);
    if (profile.target_job && !targetJob) setTargetJob(profile.target_job);
    if (profile.experience_years && !experienceYears) setExperienceYears(String(profile.experience_years));
    if (profile.industry && !industry) setIndustry(profile.industry);
  }, [profile]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentJob.trim() || !targetJob.trim()) {
      toast({
        title: "입력 오류",
        description: "현재 직무와 목표 직무를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setRoadmap(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-roadmap`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            currentJob,
            targetJob,
            experienceYears: experienceYears ? parseInt(experienceYears) : null,
            industry: industry || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "로드맵 생성에 실패했습니다.");
      }

      const data = await response.json();
      setRoadmap(data.roadmap);
      setExpandedMonth(1);

      toast({
        title: "로드맵 생성 완료",
        description: "6개월 경력 로드맵이 생성되었습니다.",
      });
    } catch (error: any) {
      console.error("Error generating roadmap:", error);
      toast({
        title: "오류",
        description: error.message || "로드맵 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!roadmap || !user) return;

    setSaving(true);
    try {
      const { data, error } = await supabase.from("career_roadmaps").insert({
        user_id: user.id,
        title: roadmap.title,
        job_title: currentJob,
        target_job: targetJob,
        duration_months: 6,
        milestones: roadmap as any,
        status: "active",
      }).select('id').single();

      if (error) throw error;

      setRoadmapId(data.id);

      toast({
        title: "저장 완료",
        description: "로드맵이 저장되었습니다. 이제 마일스톤을 완료 처리할 수 있습니다.",
      });
    } catch (error: any) {
      console.error("Error saving roadmap:", error);
      toast({
        title: "저장 실패",
        description: error.message || "로드맵 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMilestone = async (monthIndex: number) => {
    if (!roadmap || !roadmapId) {
      toast({
        title: "저장 필요",
        description: "마일스톤을 완료 처리하려면 먼저 로드맵을 저장해주세요.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingMilestone(monthIndex);

    try {
      const updatedMilestones = roadmap.milestones.map((milestone, idx) => {
        if (idx === monthIndex) {
          return { ...milestone, completed: !milestone.completed };
        }
        return milestone;
      });

      const updatedRoadmap = { ...roadmap, milestones: updatedMilestones };

      const { error } = await supabase
        .from("career_roadmaps")
        .update({ milestones: updatedRoadmap as any })
        .eq("id", roadmapId);

      if (error) throw error;

      setRoadmap(updatedRoadmap);

      const isCompleted = !roadmap.milestones[monthIndex].completed;
      toast({
        title: isCompleted ? "마일스톤 완료" : "마일스톤 미완료",
        description: `${monthIndex + 1}월차 마일스톤이 ${isCompleted ? "완료" : "미완료"} 처리되었습니다.`,
      });
    } catch (error: any) {
      console.error("Error updating milestone:", error);
      toast({
        title: "업데이트 실패",
        description: error.message || "마일스톤 상태 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setUpdatingMilestone(null);
    }
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
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              대시보드로 돌아가기
            </Link>
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
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Brain className="w-5 h-5" />
            <span className="font-medium">AI 경력 로드맵</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            6개월 맞춤형 성장 계획
          </h1>
          <p className="text-muted-foreground">
            현재 역할과 목표 직책을 입력하면 AI가 맞춤형 로드맵을 생성합니다
          </p>
        </div>

        {/* Input Form */}
        <Card className="p-6 mb-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentJob">현재 직무 *</Label>
                <Input
                  id="currentJob"
                  placeholder="예: 프론트엔드 개발자"
                  value={currentJob}
                  onChange={(e) => setCurrentJob(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetJob">목표 직무 *</Label>
                <Input
                  id="targetJob"
                  placeholder="예: 풀스택 개발자"
                  value={targetJob}
                  onChange={(e) => setTargetJob(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">경력 연수 (선택)</Label>
                <Input
                  id="experience"
                  type="number"
                  placeholder="예: 3"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="h-12"
                  min="0"
                  max="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">산업 분야 (선택)</Label>
                <Input
                  id="industry"
                  placeholder="예: IT/소프트웨어"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  AI가 로드맵을 생성하고 있습니다...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  로드맵 생성하기
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Roadmap Result */}
        {roadmap && !roadmap.parseError && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{roadmap.title}</h2>
                  <p className="text-muted-foreground">{roadmap.summary}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      저장
                    </>
                  )}
                </Button>
              </div>

              {/* Key Skills */}
              {roadmap.keySkills && roadmap.keySkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {roadmap.keySkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Monthly Milestones */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                월별 마일스톤
              </h3>
              {roadmap.milestones?.map((milestone, milestoneIndex) => (
                <Card key={milestone.month} className={`overflow-hidden ${milestone.completed ? 'ring-2 ring-green-500/50 bg-green-50/30 dark:bg-green-950/20' : ''}`}>
                  <div className="flex items-center">
                    {/* Complete Toggle Button */}
                    <button
                      onClick={() => handleToggleMilestone(milestoneIndex)}
                      disabled={!roadmapId || updatingMilestone === milestoneIndex}
                      className={`flex-shrink-0 p-4 border-r border-border hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        milestone.completed ? 'bg-green-100/50 dark:bg-green-900/30' : ''
                      }`}
                      title={roadmapId ? (milestone.completed ? "미완료로 변경" : "완료 처리") : "먼저 로드맵을 저장해주세요"}
                    >
                      {updatingMilestone === milestoneIndex ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      ) : milestone.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground" />
                      )}
                    </button>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() =>
                        setExpandedMonth(
                          expandedMonth === milestone.month ? null : milestone.month
                        )
                      }
                      className="flex-1 p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          milestone.completed ? 'bg-green-500/20' : 'bg-primary/10'
                        }`}>
                          <span className={`font-bold ${milestone.completed ? 'text-green-600 dark:text-green-400' : 'text-primary'}`}>
                            {milestone.month}월
                          </span>
                        </div>
                        <div>
                          <h4 className={`font-semibold ${milestone.completed ? 'text-green-700 dark:text-green-300 line-through' : 'text-foreground'}`}>
                            {milestone.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {milestone.goals?.length || 0}개 목표 · {milestone.actions?.length || 0}개 실행 항목
                            {milestone.completed && <span className="ml-2 text-green-600 dark:text-green-400">✓ 완료</span>}
                          </p>
                        </div>
                      </div>
                      {expandedMonth === milestone.month ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  {expandedMonth === milestone.month && (
                    <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                      {/* Goals */}
                      {milestone.goals && milestone.goals.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            목표
                          </h5>
                          <ul className="space-y-1">
                            {milestone.goals.map((goal, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {goal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Actions */}
                      {milestone.actions && milestone.actions.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            실행 항목
                          </h5>
                          <ul className="space-y-1">
                            {milestone.actions.map((action, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground pl-6">
                                • {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Skills */}
                      {milestone.skills && milestone.skills.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                            <Brain className="w-4 h-4 text-primary" />
                            습득할 기술
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {milestone.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resources */}
                      {milestone.resources && milestone.resources.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            추천 리소스
                          </h5>
                          <ul className="space-y-1">
                            {milestone.resources.map((resource, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground pl-6">
                                📚 {resource}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Challenges & Metrics */}
            <div className="grid md:grid-cols-2 gap-4">
              {roadmap.potentialChallenges && roadmap.potentialChallenges.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    예상 도전 과제
                  </h4>
                  <ul className="space-y-2">
                    {roadmap.potentialChallenges.map((challenge, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500">⚠</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {roadmap.successMetrics && roadmap.successMetrics.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    성공 지표
                  </h4>
                  <ul className="space-y-2">
                    {roadmap.successMetrics.map((metric, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        {metric}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Raw content fallback */}
        {roadmap?.parseError && roadmap.rawContent && (
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">생성된 로드맵</h3>
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
              {roadmap.rawContent}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
