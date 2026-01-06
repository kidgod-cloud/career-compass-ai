import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, PenTool, Loader2, Lightbulb, Calendar, Hash, Target, TrendingUp, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContentData {
  contentStrategy: {
    positioning: string;
    uniqueAngle: string;
    coreThemes: string[];
  };
  contentPillars: Array<{
    pillar: string;
    description: string;
    percentage: number;
    examples: string[];
  }>;
  postIdeas: Array<{
    type: string;
    title: string;
    hook: string;
    outline: string[];
    cta: string;
    hashtags: string[];
    bestTime: string;
    expectedEngagement: string;
  }>;
  weeklyPlan: {
    monday: { type: string; theme: string };
    tuesday: { type: string; theme: string };
    wednesday: { type: string; theme: string };
    thursday: { type: string; theme: string };
    friday: { type: string; theme: string };
  };
  engagementTips: Array<{
    tip: string;
    why: string;
    howTo: string;
  }>;
  trendingFormats: Array<{
    format: string;
    description: string;
    example: string;
  }>;
  hashtagStrategy: {
    primary: string[];
    secondary: string[];
    niche: string[];
    tips: string;
  };
  monthlyGoals: {
    posts: string;
    engagement: string;
    followers: string;
    milestones: string[];
  };
}

export default function ContentStrategy() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentData | null>(null);
  const [formData, setFormData] = useState({
    targetAudience: "",
    industry: "",
    expertise: "",
    goals: "",
    tone: "professional",
    frequency: "daily",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("content-strategy", {
        body: formData,
      });

      if (error) throw error;
      setResult(data);
      toast({
        title: "생성 완료",
        description: "콘텐츠 전략이 생성되었습니다.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "오류 발생",
        description: "생성 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dayNames: Record<string, string> = {
    monday: "월요일",
    tuesday: "화요일",
    wednesday: "수요일",
    thursday: "목요일",
    friday: "금요일",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>대시보드로 돌아가기</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <PenTool className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">콘텐츠 전략</h1>
              <p className="text-muted-foreground">LinkedIn 게시물 아이디어와 콘텐츠 전략을 AI가 생성합니다</p>
            </div>
          </div>

          {!result ? (
            <Card>
              <CardHeader>
                <CardTitle>콘텐츠 정보 입력</CardTitle>
                <CardDescription>
                  목표와 전문 분야를 입력하면 맞춤형 콘텐츠 전략을 제안해드립니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetAudience">타겟 오디언스</Label>
                      <Input
                        id="targetAudience"
                        placeholder="예: 주니어 개발자, 스타트업 창업자"
                        value={formData.targetAudience}
                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">산업 분야</Label>
                      <Input
                        id="industry"
                        placeholder="예: IT/테크, 마케팅"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expertise">전문 분야/기술</Label>
                    <Input
                      id="expertise"
                      placeholder="예: React, AI/ML, 프로덕트 매니지먼트"
                      value={formData.expertise}
                      onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goals">콘텐츠 목표</Label>
                    <Textarea
                      id="goals"
                      placeholder="LinkedIn 콘텐츠를 통해 달성하고 싶은 목표를 작성해주세요 (예: 개인 브랜딩, 채용 기회, 네트워킹)"
                      value={formData.goals}
                      onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tone">선호하는 톤</Label>
                      <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">전문적/프로페셔널</SelectItem>
                          <SelectItem value="casual">캐주얼/친근함</SelectItem>
                          <SelectItem value="storytelling">스토리텔링</SelectItem>
                          <SelectItem value="educational">교육적/정보 제공</SelectItem>
                          <SelectItem value="inspirational">영감을 주는</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">게시 빈도</Label>
                      <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">매일</SelectItem>
                          <SelectItem value="weekdays">평일만</SelectItem>
                          <SelectItem value="3times">주 3회</SelectItem>
                          <SelectItem value="weekly">주 1회</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        생성 중...
                      </>
                    ) : (
                      <>
                        <PenTool className="w-4 h-4 mr-2" />
                        콘텐츠 전략 생성
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Button variant="outline" onClick={() => setResult(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                새로 생성하기
              </Button>

              <Tabs defaultValue="strategy" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                  <TabsTrigger value="strategy">전략</TabsTrigger>
                  <TabsTrigger value="ideas">게시물 아이디어</TabsTrigger>
                  <TabsTrigger value="weekly">주간 계획</TabsTrigger>
                  <TabsTrigger value="hashtags">해시태그</TabsTrigger>
                  <TabsTrigger value="tips">참여도 팁</TabsTrigger>
                  <TabsTrigger value="goals">월간 목표</TabsTrigger>
                </TabsList>

                <TabsContent value="strategy" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        브랜드 포지셔닝
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">포지셔닝 전략</p>
                        <p className="text-foreground">{result.contentStrategy.positioning}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">차별화 포인트</p>
                        <p className="text-foreground">{result.contentStrategy.uniqueAngle}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">핵심 주제</p>
                        <div className="flex flex-wrap gap-2">
                          {result.contentStrategy.coreThemes.map((theme, i) => (
                            <Badge key={i} variant="secondary">{theme}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>콘텐츠 필러</CardTitle>
                      <CardDescription>콘텐츠의 핵심 기둥이 되는 주제들입니다</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.contentPillars.map((pillar, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-foreground">{pillar.pillar}</h4>
                            <Badge>{pillar.percentage}%</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{pillar.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {pillar.examples.map((ex, i) => (
                              <Badge key={i} variant="outline">{ex}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        트렌딩 포맷
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.trendingFormats.map((format, index) => (
                        <div key={index} className="p-4 bg-muted/50 rounded-lg">
                          <h4 className="font-semibold text-foreground mb-1">{format.format}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{format.description}</p>
                          <p className="text-sm text-primary italic">예시: {format.example}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ideas" className="mt-6 space-y-4">
                  {result.postIdeas.map((idea, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge className="mb-2">{idea.type}</Badge>
                            <CardTitle className="text-lg">{idea.title}</CardTitle>
                          </div>
                          <Badge variant="outline">{idea.expectedEngagement}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-3 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                          <p className="text-sm font-medium text-foreground">🔥 훅 (첫 문장)</p>
                          <p className="text-muted-foreground">{idea.hook}</p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">본문 구조</p>
                          <ul className="space-y-1">
                            {idea.outline.map((point, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="text-primary">•</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-semibold text-foreground mb-1">CTA (행동 유도)</p>
                          <p className="text-sm text-muted-foreground">{idea.cta}</p>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex flex-wrap gap-1">
                            {idea.hashtags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">#{tag}</Badge>
                            ))}
                          </div>
                          <span className="text-muted-foreground">⏰ {idea.bestTime}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="weekly" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        주간 콘텐츠 계획
                      </CardTitle>
                      <CardDescription>요일별 콘텐츠 유형과 주제 가이드</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(result.weeklyPlan).map(([day, plan]) => (
                          <div key={day} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                            <div className="w-20 font-semibold text-foreground">{dayNames[day]}</div>
                            <Badge variant="outline">{plan.type}</Badge>
                            <span className="text-muted-foreground flex-1">{plan.theme}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="hashtags" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Hash className="w-5 h-5 text-primary" />
                        해시태그 전략
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">주요 해시태그</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.hashtagStrategy.primary.map((tag, i) => (
                            <Badge key={i} className="text-sm">#{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">보조 해시태그</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.hashtagStrategy.secondary.map((tag, i) => (
                            <Badge key={i} variant="secondary">#{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">니치 해시태그</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.hashtagStrategy.niche.map((tag, i) => (
                            <Badge key={i} variant="outline">#{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          해시태그 활용 팁
                        </p>
                        <p className="text-sm text-muted-foreground">{result.hashtagStrategy.tips}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tips" className="mt-6 space-y-4">
                  {result.engagementTips.map((tip, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-primary" />
                          {tip.tip}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-1">왜 중요한가?</p>
                          <p className="text-muted-foreground">{tip.why}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-semibold text-foreground mb-1">실행 방법</p>
                          <p className="text-sm text-muted-foreground">{tip.howTo}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="goals" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>월간 목표</CardTitle>
                      <CardDescription>이번 달 달성해야 할 콘텐츠 목표입니다</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-primary/10 rounded-lg text-center">
                          <p className="text-3xl font-bold text-primary">{result.monthlyGoals.posts}</p>
                          <p className="text-sm text-muted-foreground">게시물</p>
                        </div>
                        <div className="p-4 bg-primary/10 rounded-lg text-center">
                          <p className="text-3xl font-bold text-primary">{result.monthlyGoals.engagement}</p>
                          <p className="text-sm text-muted-foreground">목표 참여율</p>
                        </div>
                        <div className="p-4 bg-primary/10 rounded-lg text-center">
                          <p className="text-3xl font-bold text-primary">{result.monthlyGoals.followers}</p>
                          <p className="text-sm text-muted-foreground">예상 팔로워 증가</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">마일스톤</h4>
                        <ul className="space-y-2">
                          {result.monthlyGoals.milestones.map((milestone, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                                {i + 1}
                              </div>
                              <span className="text-muted-foreground">{milestone}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
