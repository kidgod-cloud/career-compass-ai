import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Compass, ClipboardCheck, Loader2, CheckCircle2, AlertTriangle, XCircle, Lightbulb, Mic, TrendingUp, Download, Save, History, Trash2, ChevronDown } from "lucide-react";
import { exportJobFitToPDF } from "@/utils/jobFitPdfExport";
import { useState, useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";

import JobFitResultView from "@/components/job-fit/JobFitResultView";

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

interface SavedEvaluation {
  id: string;
  job_posting: string;
  grade: string;
  score: number;
  summary: string;
  dimensions: Dimension[];
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  interview_tips: string[];
  created_at: string;
}

const gradeColors: Record<string, string> = {
  A: "bg-emerald-500 text-white",
  B: "bg-blue-500 text-white",
  C: "bg-yellow-500 text-white",
  D: "bg-orange-500 text-white",
  E: "bg-red-400 text-white",
  F: "bg-red-600 text-white",
};

const GRADES = ["A", "B", "C", "D", "E", "F"];

export default function JobFitEvaluation() {
  const [jobPosting, setJobPosting] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [history, setHistory] = useState<SavedEvaluation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMissingParamsBanner, setShowMissingParamsBanner] = useState(false);
  const [bannerFadingOut, setBannerFadingOut] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const dismissBanner = () => {
    setBannerFadingOut(true);
    setTimeout(() => {
      setShowMissingParamsBanner(false);
      setBannerFadingOut(false);
    }, 300);
  };

  const filteredHistory = history.filter((item) => {
    const matchesGrade = filterGrade === "all" || item.grade === filterGrade;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || item.job_posting.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q);
    return matchesGrade && matchesSearch;
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, loading: profileLoading } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) navigate("/auth");
      else setUserId(session.user.id);
    });
  }, [navigate]);

  useEffect(() => {
    const rawCompany = searchParams.get("company");
    const rawPosition = searchParams.get("position");
    if (rawCompany === null && rawPosition === null) return;

    const MAX_LEN = 100;
    const sanitize = (v: string | null) =>
      (v ?? "").replace(/[<>]/g, "").trim().slice(0, MAX_LEN);
    const company = sanitize(rawCompany);
    const position = sanitize(rawPosition);

    if (!company && !position) {
      setShowMissingParamsBanner(true);
      // 7.7초 후 페이드아웃 시작, 8초 후 완전 닫기
      const fadeTimer = setTimeout(() => setBannerFadingOut(true), 7700);
      const timer = setTimeout(() => {
        setShowMissingParamsBanner(false);
        setBannerFadingOut(false);
      }, 8000);
      toast({
        variant: "destructive",
        title: "URL 파라미터 오류",
        description: "회사명 또는 포지션 정보가 비어 있습니다. 직접 입력해 주세요.",
      });
      // 입력 폼(textarea)으로 포커스 이동
      const focusTimer = setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return () => {
        clearTimeout(timer);
        clearTimeout(fadeTimer);
        clearTimeout(focusTimer);
      };
    }

    const companyLine = company ? `[회사] ${company}` : `[회사] (정보 없음 — 직접 입력해 주세요)`;
    const positionLine = position ? `[포지션] ${position}` : `[포지션] (정보 없음 — 직접 입력해 주세요)`;
    const prefill = `${companyLine}\n${positionLine}\n\n[채용공고 내용을 여기에 붙여넣어 주세요]`;
    setJobPosting((prev) => prev || prefill);
  }, [searchParams, toast]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("job_fit_evaluations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setHistory((data as any[]) || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "히스토리 로딩 실패", description: err.message });
    } finally {
      setLoadingHistory(false);
    }
  };

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

  const handleSave = async () => {
    if (!result || !userId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("job_fit_evaluations").insert({
        user_id: userId,
        job_posting: jobPosting.trim(),
        grade: result.grade,
        score: result.score,
        summary: result.summary,
        dimensions: result.dimensions as any,
        strengths: result.strengths as any,
        gaps: result.gaps as any,
        recommendations: result.recommendations as any,
        interview_tips: result.interviewTips as any,
      });
      if (error) throw error;
      toast({ title: "저장 완료", description: "평가 결과가 저장되었습니다." });
      if (showHistory) fetchHistory();
    } catch (err: any) {
      toast({ variant: "destructive", title: "저장 실패", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("job_fit_evaluations").delete().eq("id", id);
      if (error) throw error;
      setHistory((prev) => prev.filter((h) => h.id !== id));
      toast({ title: "삭제 완료" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "삭제 실패", description: err.message });
    }
  };

  const loadFromHistory = (item: SavedEvaluation) => {
    setJobPosting(item.job_posting);
    setResult({
      grade: item.grade,
      score: item.score,
      summary: item.summary,
      dimensions: item.dimensions,
      strengths: item.strengths,
      gaps: item.gaps,
      recommendations: item.recommendations,
      interviewTips: item.interview_tips,
    });
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <ClipboardCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">채용 적합도 평가</h1>
              <p className="text-muted-foreground text-sm">채용공고를 붙여넣으면 AI가 프로필 기준으로 적합도를 평가합니다</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => { setShowHistory(!showHistory); if (!showHistory && history.length === 0) fetchHistory(); }}
          >
            <History className="w-4 h-4 mr-2" />
            평가 히스토리
          </Button>
        </div>

        {/* History Panel */}
        {showHistory && (
          <Card className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                평가 히스토리
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">저장된 평가 결과가 없습니다</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="채용공고 내용으로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <div className="flex gap-1 flex-wrap">
                      <Button
                        variant={filterGrade === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterGrade("all")}
                      >
                        전체
                      </Button>
                      {GRADES.map((g) => (
                        <Button
                          key={g}
                          variant={filterGrade === g ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterGrade(g)}
                        >
                          {g}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {filteredHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">검색 결과가 없습니다</p>
                  ) : (
                  <div className="space-y-3">
                  {filteredHistory.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black ${gradeColors[item.grade] || gradeColors.C}`}>
                        {item.grade}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground">{item.score}점</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(item.created_at), "yyyy.MM.dd HH:mm")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{item.job_posting.slice(0, 80)}...</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => loadFromHistory(item)}>보기</Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Missing URL params banner */}
        {showMissingParamsBanner && (
          <Alert variant="destructive" className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>회사명·포지션 정보가 없습니다</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-3">
              <span>아래 입력란에 회사명과 포지션을 포함한 채용공고 내용을 직접 입력해 주세요.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMissingParamsBanner(false)}
              >
                닫기
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Input */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <Textarea
              ref={textareaRef}
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
          <JobFitResultView
            result={result}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </main>
    </div>
  );
}
