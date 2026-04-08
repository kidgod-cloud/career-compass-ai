import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Compass, ClipboardCheck, Loader2, CheckCircle2, AlertTriangle, XCircle, Lightbulb, Mic, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

interface Dimension {
  name: string;
  score: number;
  grade: string;
  comment: string;
}

interface EvalResult {
  grade: string;
  score: number;
  summary: string;
  dimensions: Dimension[];
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  interviewTips: string[];
}

const gradeColors: Record<string, string> = {
  A: "bg-emerald-500 text-white",
  B: "bg-blue-500 text-white",
  C: "bg-yellow-500 text-white",
  D: "bg-orange-500 text-white",
  E: "bg-red-400 text-white",
  F: "bg-red-600 text-white",
};

const gradeBarColors: Record<string, string> = {
  A: "bg-emerald-500",
  B: "bg-blue-500",
  C: "bg-yellow-500",
  D: "bg-orange-500",
  E: "bg-red-400",
  F: "bg-red-600",
};

function getGradeFromScore(score: number): string {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  if (score >= 30) return "E";
  return "F";
}

export default function JobFitEvaluation() {
  const [jobPosting, setJobPosting] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) navigate("/auth");
    });
  }, [navigate]);

  const handleEvaluate = async () => {
    if (!jobPosting.trim()) {
      toast({ variant: "destructive", title: "채용공고 텍스트를 입력해주세요." });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("evaluate-job-fit", {
        body: { jobPosting: jobPosting.trim(), profile },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResult(data);
    } catch (err: any) {
      toast({ variant: "destructive", title: "평가 실패", description: err.message });
    } finally {
      setLoading(false);
    }
  };

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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary/10">
            <ClipboardCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">채용 적합도 평가</h1>
            <p className="text-muted-foreground text-sm">채용공고를 붙여넣으면 AI가 프로필 기준으로 적합도를 평가합니다</p>
          </div>
        </div>

        {/* Input */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <Textarea
              value={jobPosting}
              onChange={(e) => setJobPosting(e.target.value)}
              placeholder="채용공고 텍스트를 여기에 붙여넣으세요...&#10;&#10;예시:&#10;[채용] 프론트엔드 개발자&#10;- React, TypeScript 경험 3년 이상&#10;- ..."
              rows={10}
              className="mb-4"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {profileLoading ? "프로필 로딩 중..." : profile.job_title ? `프로필: ${profile.job_title}` : "⚠️ 프로필을 먼저 작성하면 더 정확한 평가가 가능합니다"}
              </p>
              <Button onClick={handleEvaluate} disabled={loading || !jobPosting.trim()}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />분석 중...</> : "적합도 평가하기"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Grade Overview */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black ${gradeColors[result.grade] || gradeColors.C}`}>
                    {result.grade}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-foreground">{result.score}점</span>
                      <Badge variant="outline">{result.grade === "A" || result.grade === "B" ? "추천" : result.grade === "C" ? "보통" : "보완 필요"}</Badge>
                    </div>
                    <p className="text-muted-foreground">{result.summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  항목별 평가 (10개 차원)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.dimensions.map((dim, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{dim.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{dim.score}점</span>
                        <Badge className={`text-xs px-1.5 py-0 ${gradeColors[dim.grade] || ""}`}>{dim.grade}</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-1">
                      <div
                        className={`h-2 rounded-full transition-all ${gradeBarColors[dim.grade] || "bg-primary"}`}
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{dim.comment}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Strengths & Gaps */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    강점
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    보완점
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.gaps.map((g, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <XCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  추천 액션
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Interview Tips */}
            {result.interviewTips && result.interviewTips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mic className="w-5 h-5 text-primary" />
                    면접 준비 팁
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.interviewTips.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-accent/20 text-accent-foreground text-xs flex items-center justify-center font-bold">💡</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
