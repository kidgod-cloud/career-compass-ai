import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Target, TrendingUp, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SkillAnalysis {
  skill: string;
  level: string;
  relevance: string;
}

interface RequiredSkill {
  skill: string;
  priority: string;
  currentGap: string;
  learningPath: string;
}

interface Recommendation {
  category: string;
  action: string;
  timeframe: string;
  resources: string[];
}

interface AnalysisResult {
  summary: string;
  currentSkillsAnalysis: SkillAnalysis[];
  requiredSkills: RequiredSkill[];
  recommendations: Recommendation[];
  overallReadiness: {
    percentage: number;
    assessment: string;
  };
}

const SkillAnalysis = () => {
  const navigate = useNavigate();
  const [currentSkills, setCurrentSkills] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [industry, setIndustry] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!currentSkills.trim() || !targetJob.trim()) {
      toast.error("현재 보유 기술과 목표 직무를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-skills', {
        body: { currentSkills, targetJob, experienceYears, industry }
      });

      if (error) throw error;
      
      setAnalysis(data.analysis);
      toast.success("기술 격차 분석이 완료되었습니다!");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "분석 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "필수": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "권장": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "상": return "bg-emerald-500/20 text-emerald-400";
      case "중": return "bg-blue-500/20 text-blue-400";
      default: return "bg-orange-500/20 text-orange-400";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          대시보드로 돌아가기
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">기술 격차 분석</h1>
            <p className="text-muted-foreground">
              현재 보유 기술과 목표 직무에 필요한 기술을 비교 분석합니다
            </p>
          </div>

          {!analysis ? (
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground">분석 정보 입력</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    현재 보유 기술 *
                  </label>
                  <Textarea
                    placeholder="예: Python, JavaScript, React, SQL, 데이터 분석, 프로젝트 관리..."
                    value={currentSkills}
                    onChange={(e) => setCurrentSkills(e.target.value)}
                    className="min-h-[100px] bg-background/50 border-border/50 text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    쉼표로 구분하여 입력해주세요
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    목표 직무 *
                  </label>
                  <Input
                    placeholder="예: 시니어 데이터 엔지니어"
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                    className="bg-background/50 border-border/50 text-foreground"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      경력 연수
                    </label>
                    <Input
                      type="number"
                      placeholder="예: 5"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="bg-background/50 border-border/50 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      업계
                    </label>
                    <Input
                      placeholder="예: IT/소프트웨어"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="bg-background/50 border-border/50 text-foreground"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      AI가 분석 중입니다...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      기술 격차 분석하기
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Readiness Score */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">목표 직무 준비도</h3>
                    <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                      {analysis.overallReadiness.percentage}%
                    </div>
                    <Progress value={analysis.overallReadiness.percentage} className="h-3 mb-3" />
                    <p className="text-muted-foreground">{analysis.overallReadiness.assessment}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    분석 요약
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{analysis.summary}</p>
                </CardContent>
              </Card>

              {/* Current Skills Analysis */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    현재 보유 기술 분석
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {analysis.currentSkillsAnalysis.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-foreground">{skill.skill}</span>
                          <Badge className={getLevelColor(skill.level)}>{skill.level}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{skill.relevance}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Required Skills */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    필요한 기술 및 격차
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.requiredSkills.map((skill, index) => (
                      <div key={index} className="p-4 rounded-lg bg-background/50 border border-border/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-foreground">{skill.skill}</span>
                          <Badge className={getPriorityColor(skill.priority)}>{skill.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{skill.currentGap}</p>
                        <div className="text-sm">
                          <span className="text-purple-400 font-medium">학습 경로: </span>
                          <span className="text-muted-foreground">{skill.learningPath}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    추천 액션 플랜
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.recommendations.map((rec, index) => (
                      <div key={index} className="p-4 rounded-lg bg-background/50 border border-border/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                            {rec.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">• {rec.timeframe}</span>
                        </div>
                        <p className="text-foreground mb-3">{rec.action}</p>
                        <div className="flex flex-wrap gap-2">
                          {rec.resources.map((resource, rIndex) => (
                            <span key={rIndex} className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400">
                              {resource}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setAnalysis(null)}
                  className="flex-1 border-border/50 text-foreground hover:bg-accent"
                >
                  새로운 분석 시작
                </Button>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  대시보드로 돌아가기
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillAnalysis;
