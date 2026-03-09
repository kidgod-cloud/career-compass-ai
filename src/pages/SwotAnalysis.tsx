import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  BarChart3, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  AlertTriangle,
  CheckCircle,
  Target
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SwotItem {
  title: string;
  description: string;
  leverage?: string;
  improvement?: string;
  action?: string;
  mitigation?: string;
}

interface ActionItem {
  priority: number;
  action: string;
  timeline: string;
  expectedOutcome: string;
}

interface SwotAnalysis {
  summary: string;
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  actionPlan: ActionItem[];
  overallScore: number;
}

export default function SwotAnalysis() {
  const [currentJob, setCurrentJob] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [experience, setExperience] = useState("");
  const [industry, setIndustry] = useState("");
  const [skills, setSkills] = useState("");
  const [analysis, setAnalysis] = useState<SwotAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      // Pre-fill from profile
      const { data } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      if (data) {
        if (data.job_title) setCurrentJob(data.job_title);
        if (data.target_job) setTargetJob(data.target_job);
        if (data.experience_years) setExperience(String(data.experience_years));
        if (data.industry) setIndustry(data.industry);
        if ((data as any).skills?.length) setSkills((data as any).skills.join(", "));
      }
    };
    init();
  }, [navigate]);

  const handleAnalyze = async () => {
    if (!currentJob || !targetJob || !experience || !industry || !skills) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-swot', {
        body: { currentJob, targetJob, experience: parseInt(experience), industry, skills }
      });

      if (error) throw error;
      setAnalysis(data);
      
      toast({
        title: "분석 완료",
        description: "SWOT 분석이 생성되었습니다.",
      });
    } catch (error: any) {
      console.error('SWOT analysis error:', error);
      toast({
        title: "분석 실패",
        description: error.message || "SWOT 분석 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>대시보드로 돌아가기</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
            <BarChart3 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">경력 SWOT 분석</h1>
            <p className="text-muted-foreground">AI가 강점, 약점, 기회, 위협을 분석하고 실행 계획을 제안합니다</p>
          </div>
        </div>

        {!analysis ? (
          <Card>
            <CardHeader>
              <CardTitle>정보 입력</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">현재 직무</label>
                  <Input
                    placeholder="예: 프론트엔드 개발자"
                    value={currentJob}
                    onChange={(e) => setCurrentJob(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">목표 직무</label>
                  <Input
                    placeholder="예: 풀스택 개발자"
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">경력 연수</label>
                  <Input
                    type="number"
                    placeholder="예: 3"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">업계</label>
                  <Input
                    placeholder="예: IT/소프트웨어"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">보유 기술 및 경험</label>
                <Textarea
                  placeholder="예: React, TypeScript, Node.js 경험 3년, 팀 리딩 경험, 애자일 방법론..."
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI가 분석 중입니다...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    SWOT 분석 시작
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Score Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">경력 경쟁력 점수</h2>
                    <p className="text-muted-foreground">{analysis.summary}</p>
                  </div>
                  <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SWOT Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Strengths */}
              <Card className="border-green-500/30 bg-green-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="w-5 h-5" />
                    강점 (Strengths)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.strengths.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      {item.leverage && (
                        <p className="text-sm text-green-600 mt-2">
                          <strong>활용 방법:</strong> {item.leverage}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card className="border-red-500/30 bg-red-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <TrendingDown className="w-5 h-5" />
                    약점 (Weaknesses)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.weaknesses.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      {item.improvement && (
                        <p className="text-sm text-red-600 mt-2">
                          <strong>개선 방법:</strong> {item.improvement}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Opportunities */}
              <Card className="border-blue-500/30 bg-blue-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Lightbulb className="w-5 h-5" />
                    기회 (Opportunities)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.opportunities.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      {item.action && (
                        <p className="text-sm text-blue-600 mt-2">
                          <strong>행동 계획:</strong> {item.action}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Threats */}
              <Card className="border-orange-500/30 bg-orange-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                    위협 (Threats)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.threats.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      {item.mitigation && (
                        <p className="text-sm text-orange-600 mt-2">
                          <strong>대응 전략:</strong> {item.mitigation}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Action Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  우선순위 행동 계획
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.actionPlan.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {item.priority}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{item.action}</h4>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                          <span>📅 {item.timeline}</span>
                          <span>🎯 {item.expectedOutcome}</span>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-muted-foreground/50" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => setAnalysis(null)} variant="outline" className="w-full">
              새로운 분석 시작
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
