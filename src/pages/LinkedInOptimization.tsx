import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Linkedin, Sparkles, CheckCircle, AlertCircle, Target, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisResult {
  overallScore: number;
  sections: {
    headline: {
      score: number;
      current: string;
      issues: string[];
      suggestions: string[];
      examples: string[];
    };
    summary: {
      score: number;
      current: string;
      issues: string[];
      suggestions: string[];
      improvedVersion: string;
    };
    experience: {
      score: number;
      current: string;
      issues: string[];
      suggestions: string[];
      actionVerbs: string[];
    };
    skills: {
      score: number;
      current: string;
      missingSkills: string[];
      recommendations: string[];
    };
  };
  keywords: {
    current: string[];
    recommended: string[];
    industrySpecific: string[];
  };
  atsOptimization: {
    score: number;
    tips: string[];
  };
  actionPlan: Array<{
    priority: string;
    action: string;
    impact: string;
  }>;
}

const LinkedInOptimization = () => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  
  const [formData, setFormData] = useState({
    headline: "",
    summary: "",
    experience: "",
    skills: "",
    targetJob: "",
    industry: "",
  });

  const handleAnalyze = async () => {
    if (!formData.targetJob || !formData.industry) {
      toast.error("목표 직무와 업계를 입력해주세요.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('optimize-linkedin', {
        body: formData
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast.success("프로필 분석이 완료되었습니다!");
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || "분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default: return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Linkedin className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">LinkedIn 프로필 최적화</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  목표 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetJob">목표 직무 *</Label>
                    <Input
                      id="targetJob"
                      placeholder="예: 시니어 프로덕트 매니저"
                      value={formData.targetJob}
                      onChange={(e) => setFormData({ ...formData, targetJob: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">업계 *</Label>
                    <Input
                      id="industry"
                      placeholder="예: IT/테크"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>현재 프로필 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="headline">헤드라인</Label>
                  <Input
                    id="headline"
                    placeholder="현재 LinkedIn 헤드라인을 입력하세요"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">요약 (About)</Label>
                  <Textarea
                    id="summary"
                    placeholder="현재 요약 섹션 내용을 붙여넣으세요"
                    rows={4}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">경력 사항</Label>
                  <Textarea
                    id="experience"
                    placeholder="주요 경력 내용을 입력하세요"
                    rows={4}
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">스킬</Label>
                  <Textarea
                    id="skills"
                    placeholder="보유 스킬을 쉼표로 구분하여 입력하세요"
                    rows={2}
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  />
                </div>

                <Button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                      AI 분석 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      프로필 분석하기
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {analysis ? (
              <>
                {/* Overall Score */}
                <Card>
                  <CardHeader>
                    <CardTitle>전체 프로필 점수</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                        {analysis.overallScore}
                      </div>
                      <div className="flex-1">
                        <Progress 
                          value={analysis.overallScore} 
                          className="h-3"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          {analysis.overallScore >= 80 ? "훌륭한 프로필입니다!" : 
                           analysis.overallScore >= 60 ? "개선의 여지가 있습니다." : 
                           "최적화가 필요합니다."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section Scores */}
                <Card>
                  <CardHeader>
                    <CardTitle>섹션별 분석</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Headline */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">헤드라인</h4>
                        <span className={`font-bold ${getScoreColor(analysis.sections.headline.score)}`}>
                          {analysis.sections.headline.score}점
                        </span>
                      </div>
                      <Progress value={analysis.sections.headline.score} className="h-2" />
                      <p className="text-sm text-muted-foreground">{analysis.sections.headline.current}</p>
                      {analysis.sections.headline.issues.length > 0 && (
                        <div className="space-y-1">
                          {analysis.sections.headline.issues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {analysis.sections.headline.examples.length > 0 && (
                        <div className="bg-primary/5 rounded-lg p-3 space-y-2">
                          <p className="text-sm font-medium">추천 헤드라인 예시:</p>
                          {analysis.sections.headline.examples.map((example, i) => (
                            <p key={i} className="text-sm text-primary">"{example}"</p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">요약 (About)</h4>
                        <span className={`font-bold ${getScoreColor(analysis.sections.summary.score)}`}>
                          {analysis.sections.summary.score}점
                        </span>
                      </div>
                      <Progress value={analysis.sections.summary.score} className="h-2" />
                      <p className="text-sm text-muted-foreground">{analysis.sections.summary.current}</p>
                      {analysis.sections.summary.suggestions.map((suggestion, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{suggestion}</span>
                        </div>
                      ))}
                      {analysis.sections.summary.improvedVersion && (
                        <div className="bg-primary/5 rounded-lg p-3">
                          <p className="text-sm font-medium mb-2">개선된 요약 예시:</p>
                          <p className="text-sm">{analysis.sections.summary.improvedVersion}</p>
                        </div>
                      )}
                    </div>

                    {/* Experience */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">경력 사항</h4>
                        <span className={`font-bold ${getScoreColor(analysis.sections.experience.score)}`}>
                          {analysis.sections.experience.score}점
                        </span>
                      </div>
                      <Progress value={analysis.sections.experience.score} className="h-2" />
                      <p className="text-sm text-muted-foreground">{analysis.sections.experience.current}</p>
                      {analysis.sections.experience.actionVerbs.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">추천 동작 동사:</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.sections.experience.actionVerbs.map((verb, i) => (
                              <Badge key={i} variant="secondary">{verb}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">스킬</h4>
                        <span className={`font-bold ${getScoreColor(analysis.sections.skills.score)}`}>
                          {analysis.sections.skills.score}점
                        </span>
                      </div>
                      <Progress value={analysis.sections.skills.score} className="h-2" />
                      {analysis.sections.skills.missingSkills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">추가 필요 스킬:</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.sections.skills.missingSkills.map((skill, i) => (
                              <Badge key={i} variant="outline" className="border-red-500/30 text-red-500">
                                + {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {analysis.sections.skills.recommendations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">추천 스킬:</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.sections.skills.recommendations.map((skill, i) => (
                              <Badge key={i} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Keywords */}
                <Card>
                  <CardHeader>
                    <CardTitle>키워드 분석</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.keywords.recommended.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">추천 키워드:</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords.recommended.map((keyword, i) => (
                            <Badge key={i} className="bg-primary/10 text-primary border-primary/20">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {analysis.keywords.industrySpecific.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">업계 특화 키워드:</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords.industrySpecific.map((keyword, i) => (
                            <Badge key={i} variant="outline">{keyword}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ATS Optimization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>ATS 최적화</span>
                      <span className={`text-lg ${getScoreColor(analysis.atsOptimization.score)}`}>
                        {analysis.atsOptimization.score}점
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.atsOptimization.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Action Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle>실행 계획</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.actionPlan.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority === "high" ? "높음" : item.priority === "medium" ? "중간" : "낮음"}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium">{item.action}</p>
                            <p className="text-sm text-muted-foreground">{item.impact}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center">
                  <Linkedin className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">프로필을 분석해보세요</h3>
                  <p className="text-muted-foreground">
                    현재 LinkedIn 프로필 정보를 입력하고<br />
                    AI가 제안하는 개선점을 확인하세요.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LinkedInOptimization;
