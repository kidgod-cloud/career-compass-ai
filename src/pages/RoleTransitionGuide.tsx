import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Calendar, Target, BookOpen, Users, Briefcase, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Task {
  task: string;
  priority: string;
  estimatedHours: number;
  resources: string[];
}

interface WeeklyPlan {
  week: number;
  theme: string;
  goals: string[];
  tasks: Task[];
  milestones: string[];
}

interface Course {
  name: string;
  platform: string;
  duration: string;
  priority: string;
}

interface Project {
  name: string;
  description: string;
  skills: string[];
  timeline: string;
}

interface TransitionGuide {
  summary: string;
  currentToTargetAnalysis: {
    transferableSkills: string[];
    skillGaps: string[];
    industryConsiderations: string;
    transitionDifficulty: string;
    expectedTimeframe: string;
  };
  weeklyPlan: WeeklyPlan[];
  learningPath: {
    courses: Course[];
    certifications: string[];
    books: string[];
    communities: string[];
  };
  networkingStrategy: {
    targetConnections: string[];
    platforms: string[];
    weeklyGoals: string;
    outreachTemplates: string[];
  };
  portfolioBuilder: {
    projects: Project[];
    showcaseItems: string[];
  };
  interviewPrep: {
    commonQuestions: string[];
    storyPoints: string[];
    technicalTopics: string[];
  };
  successMetrics: {
    weeklyKPIs: string[];
    monthlyCheckpoints: string[];
    readinessIndicators: string[];
  };
  riskMitigation: {
    potentialObstacles: string[];
    contingencyPlans: string[];
    supportResources: string[];
  };
  overallReadiness: number;
}

const RoleTransitionGuide = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [guide, setGuide] = useState<TransitionGuide | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  
  const [currentJob, setCurrentJob] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [experience, setExperience] = useState("");
  const [industry, setIndustry] = useState("");
  const [skills, setSkills] = useState("");
  const [challenges, setChallenges] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    getUser();
  }, [navigate]);

  const handleGenerate = async () => {
    if (!currentJob || !targetJob || !experience || !industry || !skills) {
      toast.error("모든 필수 필드를 입력해주세요.");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-transition-guide', {
        body: { currentJob, targetJob, experience, industry, skills, challenges }
      });

      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }

      setGuide(data);
      toast.success("60일 역할 전환 가이드가 생성되었습니다!");
    } catch (error: any) {
      console.error("Error generating guide:", error);
      toast.error(error.message || "가이드 생성 중 오류가 발생했습니다.");
    } finally {
      setGenerating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'challenging': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">60일 역할 전환 가이드</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">새로운 역할로의 전환</h2>
          <p className="text-muted-foreground">AI가 60일 동안의 상세한 실행 계획을 생성해드립니다.</p>
        </div>

        <Card className="mb-8 bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              전환 정보 입력
            </CardTitle>
            <CardDescription>현재 상황과 목표를 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentJob">현재 직무 *</Label>
                <Input
                  id="currentJob"
                  placeholder="예: 마케팅 매니저"
                  value={currentJob}
                  onChange={(e) => setCurrentJob(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetJob">목표 직무 *</Label>
                <Input
                  id="targetJob"
                  placeholder="예: 프로덕트 매니저"
                  value={targetJob}
                  onChange={(e) => setTargetJob(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">경력 연수 *</Label>
                <Input
                  id="experience"
                  placeholder="예: 5년"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">산업/업종 *</Label>
                <Input
                  id="industry"
                  placeholder="예: IT/테크"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">현재 보유 기술 *</Label>
              <Textarea
                id="skills"
                placeholder="예: 디지털 마케팅, 데이터 분석, 프로젝트 관리, 콘텐츠 전략"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="bg-background"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challenges">주요 고민/도전과제 (선택)</Label>
              <Textarea
                id="challenges"
                placeholder="예: 기술적 배경 부족, 관련 경험 없음, 네트워크 부족"
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                className="bg-background"
                rows={2}
              />
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={generating}
              className="w-full"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  60일 가이드 생성 중...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  60일 역할 전환 가이드 생성
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {guide && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">전환 전략 요약</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">전환 준비도</span>
                    <div className="flex items-center gap-2">
                      <Progress value={guide.overallReadiness} className="w-24 h-2" />
                      <span className="text-lg font-bold text-primary">{guide.overallReadiness}%</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-6">{guide.summary}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background/50 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">전환 난이도</h4>
                    <p className={`text-lg font-bold ${getDifficultyColor(guide.currentToTargetAnalysis.transitionDifficulty)}`}>
                      {guide.currentToTargetAnalysis.transitionDifficulty === 'easy' ? '쉬움' :
                       guide.currentToTargetAnalysis.transitionDifficulty === 'moderate' ? '보통' : '도전적'}
                    </p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">예상 기간</h4>
                    <p className="text-lg font-bold text-primary">{guide.currentToTargetAnalysis.expectedTimeframe}</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">전환 가능 스킬</h4>
                    <p className="text-lg font-bold text-green-400">{guide.currentToTargetAnalysis.transferableSkills.length}개</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    전환 가능 스킬
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {guide.currentToTargetAnalysis.transferableSkills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <Target className="h-5 w-5" />
                    채워야 할 스킬 갭
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {guide.currentToTargetAnalysis.skillGaps.map((gap, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm border border-red-500/30">
                        {gap}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Plan */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  주차별 실행 계획
                </CardTitle>
                <CardDescription>60일 동안의 상세한 주간 계획</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guide.weeklyPlan.map((week) => (
                    <div key={week.week} className="border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)}
                        className="w-full p-4 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {week.week}
                          </span>
                          <div className="text-left">
                            <h4 className="font-semibold text-foreground">{week.theme}</h4>
                            <p className="text-sm text-muted-foreground">{week.goals.length}개 목표 · {week.tasks.length}개 과제</p>
                          </div>
                        </div>
                        <TrendingUp className={`h-5 w-5 text-muted-foreground transition-transform ${expandedWeek === week.week ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {expandedWeek === week.week && (
                        <div className="p-4 space-y-4 bg-background/50">
                          <div>
                            <h5 className="font-semibold text-foreground mb-2">주간 목표</h5>
                            <ul className="space-y-1">
                              {week.goals.map((goal, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  {goal}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 className="font-semibold text-foreground mb-2">실행 과제</h5>
                            <div className="space-y-2">
                              {week.tasks.map((task, idx) => (
                                <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-foreground">{task.task}</p>
                                    <span className={`px-2 py-0.5 text-xs rounded border ${getPriorityColor(task.priority)}`}>
                                      {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">예상 소요: {task.estimatedHours}시간</p>
                                  {task.resources.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {task.resources.map((resource, rIdx) => (
                                        <span key={rIdx} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                                          {resource}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {week.milestones.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-foreground mb-2">마일스톤</h5>
                              <div className="flex flex-wrap gap-2">
                                {week.milestones.map((milestone, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                                    🎯 {milestone}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Path */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  학습 경로
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">추천 강좌</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {guide.learningPath.courses.map((course, idx) => (
                      <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-start justify-between">
                          <h5 className="font-medium text-foreground">{course.name}</h5>
                          <span className={`px-2 py-0.5 text-xs rounded border ${getPriorityColor(course.priority)}`}>
                            {course.priority === 'high' ? '필수' : course.priority === 'medium' ? '권장' : '선택'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{course.platform} · {course.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">추천 자격증</h4>
                    <ul className="space-y-1">
                      {guide.learningPath.certifications.map((cert, idx) => (
                        <li key={idx} className="text-muted-foreground text-sm">📜 {cert}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">추천 도서</h4>
                    <ul className="space-y-1">
                      {guide.learningPath.books.map((book, idx) => (
                        <li key={idx} className="text-muted-foreground text-sm">📚 {book}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">추천 커뮤니티</h4>
                    <ul className="space-y-1">
                      {guide.learningPath.communities.map((comm, idx) => (
                        <li key={idx} className="text-muted-foreground text-sm">👥 {comm}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Networking & Portfolio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    네트워킹 전략
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">타겟 연결</h4>
                    <div className="flex flex-wrap gap-2">
                      {guide.networkingStrategy.targetConnections.map((conn, idx) => (
                        <span key={idx} className="px-2 py-1 bg-muted text-muted-foreground rounded text-sm">
                          {conn}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">추천 플랫폼</h4>
                    <div className="flex flex-wrap gap-2">
                      {guide.networkingStrategy.platforms.map((platform, idx) => (
                        <span key={idx} className="px-2 py-1 bg-primary/20 text-primary rounded text-sm">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">주간 목표</h4>
                    <p className="text-muted-foreground text-sm">{guide.networkingStrategy.weeklyGoals}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    포트폴리오 구축
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {guide.portfolioBuilder.projects.map((project, idx) => (
                    <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                      <h5 className="font-medium text-foreground">{project.name}</h5>
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">⏱️ {project.timeline}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Interview Prep & Risk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    면접 준비
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">예상 질문</h4>
                    <ul className="space-y-1">
                      {guide.interviewPrep.commonQuestions.slice(0, 5).map((q, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">❓ {q}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">준비할 스토리</h4>
                    <ul className="space-y-1">
                      {guide.interviewPrep.storyPoints.map((story, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">📖 {story}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    리스크 관리
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">잠재적 장애물</h4>
                    <ul className="space-y-1">
                      {guide.riskMitigation.potentialObstacles.map((obs, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">⚠️ {obs}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">대응 계획</h4>
                    <ul className="space-y-1">
                      {guide.riskMitigation.contingencyPlans.map((plan, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">✅ {plan}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Success Metrics */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  성공 지표
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">주간 KPI</h4>
                    <ul className="space-y-1">
                      {guide.successMetrics.weeklyKPIs.map((kpi, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">📊 {kpi}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">월간 체크포인트</h4>
                    <ul className="space-y-1">
                      {guide.successMetrics.monthlyCheckpoints.map((cp, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">🎯 {cp}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">준비 완료 지표</h4>
                    <ul className="space-y-1">
                      {guide.successMetrics.readinessIndicators.map((ind, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">✨ {ind}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default RoleTransitionGuide;
