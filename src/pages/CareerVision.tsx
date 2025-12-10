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
import { ArrowLeft, Compass, Eye, Loader2, Target, CheckCircle, AlertTriangle, Lightbulb, TrendingUp, Shield, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VisionAnalysis {
  alignmentScore: number;
  visionAnalysis: {
    clarity: string;
    feasibility: string;
    motivation: string;
  };
  alignmentAnalysis: {
    aligned: string[];
    misaligned: string[];
    gaps: string[];
  };
  valueAlignment: {
    score: number;
    analysis: string;
  };
  milestones: {
    year: number;
    title: string;
    goals: string[];
    actions: string[];
  }[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  riskFactors: string[];
  successFactors: string[];
  refinedVision: string;
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

export default function CareerVision() {
  const [currentJob, setCurrentJob] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [industry, setIndustry] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [threeYearVision, setThreeYearVision] = useState("");
  const [currentGoals, setCurrentGoals] = useState("");
  const [values, setValues] = useState("");
  const [analysis, setAnalysis] = useState<VisionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const analyzeVision = async () => {
    if (!currentJob.trim() || !targetJob.trim() || !threeYearVision.trim()) {
      toast({
        variant: "destructive",
        title: "입력 필요",
        description: "현재 직무, 목표 직무, 3년 비전을 입력해주세요.",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-vision', {
        body: {
          currentJob,
          targetJob,
          industry,
          experienceYears: experienceYears ? parseInt(experienceYears) : 0,
          threeYearVision,
          currentGoals,
          values,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAnalysis(data);
      toast({
        title: "분석 완료",
        description: "경력 비전 분석이 완료되었습니다.",
      });
    } catch (error: any) {
      console.error("Error analyzing vision:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description: error.message || "분석 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

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
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">커리어 비전 정렬</h1>
          </div>
          <p className="text-muted-foreground">
            3년 경력 비전을 분석하고 현재 목표와의 정렬 상태를 확인하세요.
          </p>
        </div>

        {!analysis ? (
          <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentJob">현재 직무 *</Label>
                <Input
                  id="currentJob"
                  placeholder="예: 주니어 개발자"
                  value={currentJob}
                  onChange={(e) => setCurrentJob(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetJob">목표 직무 *</Label>
                <Input
                  id="targetJob"
                  placeholder="예: 테크 리드"
                  value={targetJob}
                  onChange={(e) => setTargetJob(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">업계</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="업계를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">경력 연수</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  placeholder="예: 3"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vision">3년 경력 비전 *</Label>
              <Textarea
                id="vision"
                placeholder="3년 후 자신의 모습을 구체적으로 설명해주세요. 어떤 역할을 하고 있을지, 어떤 성과를 이루고 싶은지, 어떤 환경에서 일하고 싶은지 등..."
                value={threeYearVision}
                onChange={(e) => setThreeYearVision(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">현재 목표</Label>
              <Textarea
                id="goals"
                placeholder="현재 단기/중기적으로 추구하고 있는 목표들을 적어주세요..."
                value={currentGoals}
                onChange={(e) => setCurrentGoals(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="values">중요한 가치관</Label>
              <Input
                id="values"
                placeholder="예: 워라밸, 성장, 창의성, 안정성, 영향력"
                value={values}
                onChange={(e) => setValues(e.target.value)}
              />
            </div>

            <Button 
              className="w-full" 
              size="lg" 
              onClick={analyzeVision}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  비전 분석 중...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  비전 분석 시작
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Alignment Score */}
            <div className="bg-card rounded-2xl border border-border p-6 text-center">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(analysis.alignmentScore)}`}>
                {analysis.alignmentScore}%
              </div>
              <div className="text-muted-foreground">비전-목표 정렬 점수</div>
            </div>

            {/* Vision Analysis */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                비전 분석
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm font-medium text-primary mb-2">명확성</div>
                  <p className="text-sm text-muted-foreground">{analysis.visionAnalysis.clarity}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm font-medium text-primary mb-2">실현 가능성</div>
                  <p className="text-sm text-muted-foreground">{analysis.visionAnalysis.feasibility}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm font-medium text-primary mb-2">동기 부여</div>
                  <p className="text-sm text-muted-foreground">{analysis.visionAnalysis.motivation}</p>
                </div>
              </div>
            </div>

            {/* Alignment Analysis */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-foreground">정렬된 요소</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.alignmentAnalysis.aligned.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-foreground">불일치 요소</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.alignmentAnalysis.misaligned.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-foreground">채워야 할 간극</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.alignmentAnalysis.gaps.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Value Alignment */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  가치관 정렬
                </h3>
                <span className={`text-2xl font-bold ${getScoreColor(analysis.valueAlignment.score)}`}>
                  {analysis.valueAlignment.score}%
                </span>
              </div>
              <p className="text-muted-foreground">{analysis.valueAlignment.analysis}</p>
            </div>

            {/* 3-Year Milestones */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                3년 마일스톤
              </h3>
              <div className="space-y-6">
                {analysis.milestones.map((milestone) => (
                  <div key={milestone.year} className="border-l-2 border-primary pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {milestone.year}년차
                      </span>
                      <h4 className="font-medium text-foreground">{milestone.title}</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">목표</div>
                        <ul className="space-y-1">
                          {milestone.goals.map((goal, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">• {goal}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">실행 항목</div>
                        <ul className="space-y-1">
                          {milestone.actions.map((action, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">• {action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                실행 권장 사항
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-emerald-500/10">
                  <div className="text-sm font-medium text-emerald-600 mb-2">즉시 실행</div>
                  <ul className="space-y-1">
                    {analysis.recommendations.immediate.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10">
                  <div className="text-sm font-medium text-amber-600 mb-2">3-6개월 내</div>
                  <ul className="space-y-1">
                    {analysis.recommendations.shortTerm.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10">
                  <div className="text-sm font-medium text-blue-600 mb-2">장기적</div>
                  <ul className="space-y-1">
                    {analysis.recommendations.longTerm.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Risk & Success Factors */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-foreground">위험 요소</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.riskFactors.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-foreground">성공 요소</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.successFactors.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Refined Vision */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                개선된 비전 제안
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{analysis.refinedVision}</p>
            </div>

            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => setAnalysis(null)}
              className="w-full"
            >
              새로운 분석 시작
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
