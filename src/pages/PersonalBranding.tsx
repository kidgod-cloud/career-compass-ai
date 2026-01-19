import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, ArrowLeft, Loader2, Sparkles, Target, Palette, MessageSquare, CheckCircle, User, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BrandAnalysis {
  brandStatement: {
    headline: string;
    elevator_pitch: string;
    tagline: string;
    mission: string;
  };
  uniqueValueProposition: {
    main: string;
    supporting_points: string[];
    proof_points: string[];
  };
  brandPersonality: {
    traits: string[];
    tone: string;
    archetype: string;
  };
  visualIdentity: {
    color_palette: string[];
    style_keywords: string[];
    imagery_direction: string;
  };
  contentPillars: Array<{
    pillar: string;
    description: string;
    example_topics: string[];
  }>;
  onlinePresence: {
    linkedin_headline: string;
    linkedin_summary: string;
    bio_short: string;
    bio_long: string;
  };
  storytelling: {
    origin_story: string;
    transformation_story: string;
    key_anecdotes: string[];
  };
  actionPlan: {
    week1: string[];
    week2: string[];
    week3: string[];
    week4: string[];
  };
  metrics: {
    kpis: string[];
    milestones: Array<{
      timeline: string;
      goal: string;
    }>;
  };
}

export default function PersonalBranding() {
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [strengths, setStrengths] = useState("");
  const [values, setValues] = useState("");
  const [uniqueExperiences, setUniqueExperiences] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BrandAnalysis | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentRole || !targetRole || !industry || !strengths) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("personal-branding", {
        body: { currentRole, targetRole, industry, strengths, values, uniqueExperiences, targetAudience },
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: "분석 완료",
        description: "개인 브랜드 전략이 생성되었습니다!",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "오류 발생",
        description: "분석 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>대시보드로 돌아가기</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Award className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI 개인 브랜딩</h1>
              <p className="text-muted-foreground">강점 기반 개인 브랜드 선언문 생성</p>
            </div>
          </div>

          {!analysis ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  정보 입력
                </CardTitle>
                <CardDescription>개인 브랜드 전략을 위한 정보를 입력해주세요</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">현재 역할 *</label>
                      <Input
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                        placeholder="예: 프론트엔드 개발자"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">목표 역할 *</label>
                      <Input
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="예: 테크 리더"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">산업 분야 *</label>
                      <Input
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="예: IT, 핀테크"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">타겟 청중</label>
                      <Input
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="예: 주니어 개발자, 스타트업 창업자"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">핵심 강점 *</label>
                    <Textarea
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      placeholder="예: 복잡한 문제를 단순하게 설명하는 능력, 팀 협업, 새로운 기술 빠른 습득"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">핵심 가치</label>
                    <Textarea
                      value={values}
                      onChange={(e) => setValues(e.target.value)}
                      placeholder="예: 지속적인 학습, 협업, 혁신, 사용자 중심"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">독특한 경험</label>
                    <Textarea
                      value={uniqueExperiences}
                      onChange={(e) => setUniqueExperiences(e.target.value)}
                      placeholder="예: 3개 스타트업 창업 경험, 글로벌 팀 리딩, 오픈소스 기여"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        AI가 분석 중입니다...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 mr-2" />
                        개인 브랜드 생성하기
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Button variant="outline" onClick={() => setAnalysis(null)} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                다시 분석하기
              </Button>

              {/* Brand Statement */}
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    브랜드 선언문
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                    <p className="text-2xl font-bold text-foreground text-center mb-4">
                      "{analysis.brandStatement.headline}"
                    </p>
                    <p className="text-lg text-muted-foreground text-center italic">
                      {analysis.brandStatement.tagline}
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">엘리베이터 피치</h4>
                      <p className="text-sm text-muted-foreground">{analysis.brandStatement.elevator_pitch}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">미션 선언문</h4>
                      <p className="text-sm text-muted-foreground">{analysis.brandStatement.mission}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Unique Value Proposition */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    고유 가치 제안 (UVP)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-lg font-medium text-foreground">{analysis.uniqueValueProposition.main}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">차별화 요소</h4>
                      <ul className="space-y-2">
                        {analysis.uniqueValueProposition.supporting_points.map((point, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">증거 포인트</h4>
                      <ul className="space-y-2">
                        {analysis.uniqueValueProposition.proof_points.map((point, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Brand Personality */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    브랜드 퍼스널리티
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-3">성격 특성</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.brandPersonality.traits.map((trait, index) => (
                          <Badge key={index} variant="secondary">{trait}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">커뮤니케이션 톤</h4>
                      <p className="text-sm text-muted-foreground">{analysis.brandPersonality.tone}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">브랜드 아키타입</h4>
                      <p className="text-sm text-muted-foreground">{analysis.brandPersonality.archetype}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visual Identity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    비주얼 아이덴티티
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-3">컬러 팔레트</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.visualIdentity.color_palette.map((color, index) => (
                          <Badge key={index} variant="outline">{color}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-3">스타일 키워드</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.visualIdentity.style_keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">이미지 방향성</h4>
                      <p className="text-sm text-muted-foreground">{analysis.visualIdentity.imagery_direction}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Pillars */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    콘텐츠 기둥
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {analysis.contentPillars.map((pillar, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">{pillar.pillar}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{pillar.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {pillar.example_topics.map((topic, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{topic}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Online Presence */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    온라인 프레젠스
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-foreground mb-2">LinkedIn 헤드라인</h4>
                    <p className="text-sm text-muted-foreground">{analysis.onlinePresence.linkedin_headline}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">LinkedIn 요약</h4>
                    <p className="text-sm text-muted-foreground">{analysis.onlinePresence.linkedin_summary}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">짧은 바이오 (160자)</h4>
                      <p className="text-sm text-muted-foreground">{analysis.onlinePresence.bio_short}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">긴 바이오</h4>
                      <p className="text-sm text-muted-foreground">{analysis.onlinePresence.bio_long}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Storytelling */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    스토리텔링
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">기원 스토리</h4>
                    <p className="text-sm text-muted-foreground">{analysis.storytelling.origin_story}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">변화 스토리</h4>
                    <p className="text-sm text-muted-foreground">{analysis.storytelling.transformation_story}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">핵심 일화</h4>
                    <ul className="space-y-2">
                      {analysis.storytelling.key_anecdotes.map((anecdote, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          {anecdote}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Action Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    4주 실행 계획
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    {Object.entries(analysis.actionPlan).map(([week, actions], index) => (
                      <div key={week} className="p-4 border border-border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-3">
                          Week {index + 1}
                        </h4>
                        <ul className="space-y-2">
                          {actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="w-3 h-3 text-primary mt-1 shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    성과 지표 및 마일스톤
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">핵심 KPI</h4>
                      <ul className="space-y-2">
                        {analysis.metrics.kpis.map((kpi, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            {kpi}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">마일스톤</h4>
                      <div className="space-y-3">
                        {analysis.metrics.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Badge variant="outline">{milestone.timeline}</Badge>
                            <span className="text-sm text-muted-foreground">{milestone.goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
