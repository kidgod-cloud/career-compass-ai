import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, FileText, Loader2, CheckCircle2, AlertTriangle, Lightbulb, Target, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ResumeUpload, ParsedResume } from "@/components/ResumeUpload";

interface ResumeAnalysis {
  atsScore: number;
  summary: string;
  keywordAnalysis: {
    found: string[];
    missing: string[];
    recommendations: string;
  };
  formatIssues: Array<{
    issue: string;
    suggestion: string;
    priority: "high" | "medium" | "low";
  }>;
  contentImprovements: Array<{
    section: string;
    original: string;
    improved: string;
    reason: string;
  }>;
  strengthPoints: string[];
  actionItems: Array<{
    action: string;
    impact: "high" | "medium" | "low";
    timeEstimate: string;
  }>;
}

const ResumeOptimization = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resumeContent, setResumeContent] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [industry, setIndustry] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

  const handleResumeParsed = (data: ParsedResume) => {
    if (data.resume_text) {
      setResumeContent(data.resume_text);
    } else if (data.summary) {
      setResumeContent(data.summary);
    }
    if (data.job_title && !targetJob) setTargetJob(data.job_title);
    if (data.industry && !industry) setIndustry(data.industry);
  };

  const handleAnalyze = async () => {
    if (!resumeContent.trim()) {
      toast({
        title: "이력서 내용을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("optimize-resume", {
        body: { resumeContent, targetJob, industry },
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "이력서 분석이 완료되었습니다",
      });
    } catch (error: any) {
      console.error("Resume analysis error:", error);
      toast({
        title: "분석 중 오류가 발생했습니다",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low": return "bg-green-500/10 text-green-500 border-green-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-primary/10 text-primary border-primary/20";
      case "medium": return "bg-secondary text-secondary-foreground";
      case "low": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          대시보드로 돌아가기
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            AI 이력서 최적화
          </h1>
          <p className="text-muted-foreground">
            이력서 내용을 입력하면 ATS 호환성을 분석하고 개선점을 제안해드립니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">이력서 정보 입력</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetJob">목표 직무</Label>
                    <Input
                      id="targetJob"
                      placeholder="예: 프론트엔드 개발자"
                      value={targetJob}
                      onChange={(e) => setTargetJob(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">업계</Label>
                    <Input
                      id="industry"
                      placeholder="예: IT/소프트웨어"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resumeContent">이력서 내용</Label>
                  <Textarea
                    id="resumeContent"
                    placeholder="이력서 전체 내용을 붙여넣기 하세요..."
                    value={resumeContent}
                    onChange={(e) => setResumeContent(e.target.value)}
                    className="min-h-[400px] resize-none"
                  />
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading || !resumeContent.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      이력서 분석하기
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {analysis ? (
              <>
                {/* ATS Score Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      ATS 호환성 점수
                      <span className={`text-3xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                        {analysis.atsScore}점
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={analysis.atsScore} className="h-3 mb-4" />
                    <p className="text-muted-foreground text-sm">{analysis.summary}</p>
                  </CardContent>
                </Card>

                {/* Strength Points */}
                {analysis.strengthPoints?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        강점
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.strengthPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Keyword Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">키워드 분석</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.keywordAnalysis?.found?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">발견된 키워드</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywordAnalysis.found.map((keyword, index) => (
                            <Badge key={index} variant="secondary">{keyword}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {analysis.keywordAnalysis?.missing?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">추가 권장 키워드</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywordAnalysis.missing.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="border-primary/50 text-primary">
                              + {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {analysis.keywordAnalysis?.recommendations && (
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        💡 {analysis.keywordAnalysis.recommendations}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Format Issues */}
                {analysis.formatIssues?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        형식 개선점
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.formatIssues.map((issue, index) => (
                          <div key={index} className="border border-border rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getPriorityColor(issue.priority)}>
                                {issue.priority === "high" ? "높음" : issue.priority === "medium" ? "중간" : "낮음"}
                              </Badge>
                              <span className="font-medium text-sm">{issue.issue}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{issue.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Content Improvements */}
                {analysis.contentImprovements?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        내용 개선 제안
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysis.contentImprovements.map((improvement, index) => (
                          <div key={index} className="border border-border rounded-lg p-4">
                            <Badge variant="outline" className="mb-3">{improvement.section}</Badge>
                            <div className="space-y-2">
                              <div className="bg-red-500/5 border border-red-500/20 rounded p-2">
                                <p className="text-xs text-red-500 font-medium mb-1">기존</p>
                                <p className="text-sm line-through text-muted-foreground">{improvement.original}</p>
                              </div>
                              <div className="bg-green-500/5 border border-green-500/20 rounded p-2">
                                <p className="text-xs text-green-500 font-medium mb-1">개선</p>
                                <p className="text-sm text-foreground">{improvement.improved}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">💡 {improvement.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Items */}
                {analysis.actionItems?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        실행 항목
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.actionItems.map((item, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.action}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={getImpactColor(item.impact)}>
                                  영향도: {item.impact === "high" ? "높음" : item.impact === "medium" ? "중간" : "낮음"}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {item.timeEstimate}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center">
                  <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    이력서를 입력하고 분석하기 버튼을 클릭하세요.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeOptimization;
