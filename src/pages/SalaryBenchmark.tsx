import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Minus, Target, MessageSquare, Briefcase, Lightbulb, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SalaryAnalysis {
  marketAnalysis: {
    entryLevel: { min: number; max: number; median: number };
    midLevel: { min: number; max: number; median: number };
    seniorLevel: { min: number; max: number; median: number };
    yourRange: { min: number; max: number; recommended: number };
  };
  salaryFactors: Array<{ factor: string; impact: string; description: string; adjustmentPercent: number }>;
  industryComparison: Array<{ industry: string; averageSalary: number; trend: string }>;
  skillPremiums: Array<{ skill: string; premiumPercent: number; demand: string; recommendation: string }>;
  negotiationStrategy: {
    targetSalary: number;
    minimumAcceptable: number;
    openingAsk: number;
    keyPoints: string[];
    timingTips: string[];
    commonMistakes: string[];
  };
  negotiationScripts: Array<{ scenario: string; script: string; tips: string[] }>;
  totalCompensation: {
    basePercent: number;
    bonusRange: { min: number; max: number };
    equityCommon: boolean;
    benefits: Array<{ type: string; value: string; negotiable: boolean }>;
  };
  marketTrends: {
    demandLevel: string;
    salaryTrend: string;
    trendPercent: number;
    hotSkills: string[];
    forecast: string;
  };
  actionPlan: Array<{ priority: number; action: string; timeline: string; expectedImpact: string }>;
  additionalTips: string[];
}

const SalaryBenchmark = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SalaryAnalysis | null>(null);

  const { profile } = useProfile();
  const [formData, setFormData] = useState({
    targetJob: "",
    industry: "",
    experienceYears: "",
    location: "서울",
    currentSalary: "",
    skills: "",
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      targetJob: prev.targetJob || profile.target_job,
      industry: prev.industry || profile.industry,
      experienceYears: prev.experienceYears || (profile.experience_years ? String(profile.experience_years) : ""),
      skills: prev.skills || profile.skills.join(", "),
    }));
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.targetJob || !formData.industry || !formData.experienceYears) {
      toast({ title: "필수 항목을 입력해주세요", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('salary-benchmark', {
        body: formData,
      });

      if (error) throw error;
      setAnalysis(data.analysis);
      toast({ title: "급여 분석이 완료되었습니다!" });
    } catch (error: any) {
      console.error('Error:', error);
      toast({ title: "분석 중 오류가 발생했습니다", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const formatSalary = (value: number) => `${value.toLocaleString()}만원`;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDemandBadge = (demand: string) => {
    switch (demand) {
      case 'high':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">높음</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">보통</Badge>;
      default:
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">낮음</Badge>;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'text-green-400';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">급여 벤치마킹</h1>
            <p className="text-sm text-muted-foreground">시장 급여 분석 및 협상 전략</p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {!analysis ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                급여 정보 입력
              </CardTitle>
              <CardDescription>목표 직무와 현재 상황을 입력하면 시장 급여를 분석하고 협상 전략을 제안해드립니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetJob">목표 직무 *</Label>
                    <Input
                      id="targetJob"
                      placeholder="예: 프론트엔드 개발자"
                      value={formData.targetJob}
                      onChange={(e) => setFormData({ ...formData, targetJob: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">산업군 *</Label>
                    <Select value={formData.industry} onValueChange={(v) => setFormData({ ...formData, industry: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="산업군 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IT/소프트웨어">IT/소프트웨어</SelectItem>
                        <SelectItem value="금융">금융</SelectItem>
                        <SelectItem value="제조업">제조업</SelectItem>
                        <SelectItem value="서비스">서비스</SelectItem>
                        <SelectItem value="스타트업">스타트업</SelectItem>
                        <SelectItem value="대기업">대기업</SelectItem>
                        <SelectItem value="외국계">외국계</SelectItem>
                        <SelectItem value="공공기관">공공기관</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienceYears">경력 연수 *</Label>
                    <Select value={formData.experienceYears} onValueChange={(v) => setFormData({ ...formData, experienceYears: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="경력 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">신입</SelectItem>
                        <SelectItem value="1">1년</SelectItem>
                        <SelectItem value="2">2년</SelectItem>
                        <SelectItem value="3">3년</SelectItem>
                        <SelectItem value="5">5년</SelectItem>
                        <SelectItem value="7">7년</SelectItem>
                        <SelectItem value="10">10년 이상</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">근무 지역</Label>
                    <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="서울">서울</SelectItem>
                        <SelectItem value="경기">경기</SelectItem>
                        <SelectItem value="부산">부산</SelectItem>
                        <SelectItem value="대전">대전</SelectItem>
                        <SelectItem value="대구">대구</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentSalary">현재 급여 (선택, 만원 단위)</Label>
                  <Input
                    id="currentSalary"
                    placeholder="예: 5000"
                    value={formData.currentSalary}
                    onChange={(e) => setFormData({ ...formData, currentSalary: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">보유 스킬 (선택)</Label>
                  <Textarea
                    id="skills"
                    placeholder="예: React, TypeScript, Node.js, AWS..."
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "분석 중..." : "급여 분석하기"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">급여 분석 결과</h2>
              <Button variant="outline" onClick={() => setAnalysis(null)}>새 분석</Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">추천 연봉</p>
                    <p className="text-2xl font-bold text-primary">{formatSalary(analysis.marketAnalysis.yourRange.recommended)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">협상 목표</p>
                    <p className="text-2xl font-bold">{formatSalary(analysis.negotiationStrategy.targetSalary)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">시작 제안가</p>
                    <p className="text-2xl font-bold text-green-400">{formatSalary(analysis.negotiationStrategy.openingAsk)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">최소 수용가</p>
                    <p className="text-2xl font-bold text-orange-400">{formatSalary(analysis.negotiationStrategy.minimumAcceptable)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="market" className="space-y-4">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="market"><BarChart3 className="h-4 w-4 mr-1" />시장 분석</TabsTrigger>
                <TabsTrigger value="factors"><Target className="h-4 w-4 mr-1" />급여 요인</TabsTrigger>
                <TabsTrigger value="negotiation"><MessageSquare className="h-4 w-4 mr-1" />협상 전략</TabsTrigger>
                <TabsTrigger value="compensation"><Briefcase className="h-4 w-4 mr-1" />총 보상</TabsTrigger>
                <TabsTrigger value="action"><Lightbulb className="h-4 w-4 mr-1" />액션 플랜</TabsTrigger>
              </TabsList>

              <TabsContent value="market" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>경력별 급여 범위</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      { label: '신입/주니어', data: analysis.marketAnalysis.entryLevel },
                      { label: '미들', data: analysis.marketAnalysis.midLevel },
                      { label: '시니어', data: analysis.marketAnalysis.seniorLevel },
                    ].map((level) => (
                      <div key={level.label} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{level.label}</span>
                          <span className="text-muted-foreground">
                            {formatSalary(level.data.min)} ~ {formatSalary(level.data.max)}
                          </span>
                        </div>
                        <div className="relative h-2 bg-secondary rounded-full">
                          <div
                            className="absolute h-full bg-primary/30 rounded-full"
                            style={{
                              left: '0%',
                              width: '100%',
                            }}
                          />
                          <div
                            className="absolute h-full w-2 bg-primary rounded-full"
                            style={{
                              left: `${((level.data.median - level.data.min) / (level.data.max - level.data.min)) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">중간값: {formatSalary(level.data.median)}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>산업별 비교</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.industryComparison.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <span>{item.industry}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatSalary(item.averageSalary)}</span>
                            {getTrendIcon(item.trend)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>시장 트렌드</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-secondary/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">수요 수준</p>
                        <div className="mt-2">{getDemandBadge(analysis.marketTrends.demandLevel)}</div>
                      </div>
                      <div className="text-center p-4 bg-secondary/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">급여 추세</p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                          {getTrendIcon(analysis.marketTrends.salaryTrend)}
                          <span className="font-medium">{analysis.marketTrends.trendPercent}%</span>
                        </div>
                      </div>
                      <div className="text-center p-4 bg-secondary/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">인기 스킬</p>
                        <div className="flex flex-wrap gap-1 mt-2 justify-center">
                          {analysis.marketTrends.hotSkills.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{analysis.marketTrends.forecast}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="factors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>급여 영향 요인</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.salaryFactors.map((factor, idx) => (
                        <div key={idx} className="p-4 bg-secondary/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{factor.factor}</span>
                            <span className={`font-bold ${getImpactColor(factor.impact)}`}>
                              {factor.adjustmentPercent > 0 ? '+' : ''}{factor.adjustmentPercent}%
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{factor.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>스킬별 프리미엄</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.skillPremiums.map((skill, idx) => (
                        <div key={idx} className="p-4 bg-secondary/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{skill.skill}</span>
                              {getDemandBadge(skill.demand)}
                            </div>
                            <span className="text-green-400 font-bold">+{skill.premiumPercent}%</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{skill.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="negotiation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>핵심 협상 포인트</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.negotiationStrategy.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>타이밍 팁</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.negotiationStrategy.timingTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-green-400 mt-1">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-400">피해야 할 실수</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.negotiationStrategy.commonMistakes.map((mistake, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-red-400 mt-1">✗</span>
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>협상 시나리오별 스크립트</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.negotiationScripts.map((script, idx) => (
                      <div key={idx} className="p-4 bg-secondary/30 rounded-lg space-y-3">
                        <h4 className="font-medium text-primary">{script.scenario}</h4>
                        <p className="text-sm bg-background/50 p-3 rounded border border-border/50 italic">
                          "{script.script}"
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {script.tips.map((tip, tipIdx) => (
                            <Badge key={tipIdx} variant="outline" className="text-xs">{tip}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compensation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>총 보상 구성</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/30 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">기본급 비중</p>
                        <p className="text-2xl font-bold">{analysis.totalCompensation.basePercent}%</p>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">성과급 범위</p>
                        <p className="text-2xl font-bold">
                          {analysis.totalCompensation.bonusRange.min}~{analysis.totalCompensation.bonusRange.max}%
                        </p>
                      </div>
                    </div>
                    {analysis.totalCompensation.equityCommon && (
                      <Badge className="bg-purple-500/20 text-purple-400">스톡옵션 일반적</Badge>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>복리후생</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.totalCompensation.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div>
                            <span className="font-medium">{benefit.type}</span>
                            <p className="text-sm text-muted-foreground">{benefit.value}</p>
                          </div>
                          {benefit.negotiable ? (
                            <Badge className="bg-green-500/20 text-green-400">협상 가능</Badge>
                          ) : (
                            <Badge variant="outline">고정</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="action" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>액션 플랜</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.actionPlan.map((action, idx) => (
                        <div key={idx} className="flex gap-4 p-4 bg-secondary/30 rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {action.priority}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{action.action}</h4>
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                              <span>⏱️ {action.timeline}</span>
                              <span>📈 {action.expectedImpact}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>추가 팁</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.additionalTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default SalaryBenchmark;
