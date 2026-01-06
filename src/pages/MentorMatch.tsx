import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Loader2, User, MessageSquare, Calendar, Target, Lightbulb, MapPin, CheckCircle, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MentorData {
  idealMentorProfile: {
    title: string;
    industry: string;
    experienceLevel: string;
    keySkills: string[];
    characteristics: string[];
  };
  recommendedMentors: Array<{
    type: string;
    title: string;
    why: string;
    whatToLearn: string[];
    whereToFind: string;
    approachTip: string;
  }>;
  outreachStrategy: {
    messageTemplate: string;
    subjectLine: string;
    keyPoints: string[];
    commonMistakes: string[];
  };
  meetingPreparation: {
    questionsToAsk: string[];
    topicsToDiscuss: string[];
    doAndDonts: {
      do: string[];
      dont: string[];
    };
  };
  relationshipBuilding: {
    frequency: string;
    duration: string;
    valueExchange: string[];
    progressTracking: string[];
  };
  findingPlatforms: Array<{
    platform: string;
    type: string;
    description: string;
    tips: string;
  }>;
  actionPlan: {
    week1: string[];
    week2: string[];
    week3: string[];
    week4: string[];
  };
}

export default function MentorMatch() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MentorData | null>(null);
  const [formData, setFormData] = useState({
    currentJob: "",
    targetJob: "",
    industry: "",
    experienceYears: "",
    goals: "",
    challenges: "",
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
      const { data, error } = await supabase.functions.invoke("mentor-match", {
        body: formData,
      });

      if (error) throw error;
      setResult(data);
      toast({
        title: "분석 완료",
        description: "멘토 매칭 분석이 완료되었습니다.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "오류 발생",
        description: "분석 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI 멘토 매치</h1>
              <p className="text-muted-foreground">경력 목표에 맞는 이상적인 멘토를 찾아보세요</p>
            </div>
          </div>

          {!result ? (
            <Card>
              <CardHeader>
                <CardTitle>경력 정보 입력</CardTitle>
                <CardDescription>
                  현재 상황과 목표를 입력하면 AI가 맞춤형 멘토 프로필을 추천해드립니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentJob">현재 직무</Label>
                      <Input
                        id="currentJob"
                        placeholder="예: 주니어 프론트엔드 개발자"
                        value={formData.currentJob}
                        onChange={(e) => setFormData({ ...formData, currentJob: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetJob">목표 직무</Label>
                      <Input
                        id="targetJob"
                        placeholder="예: 시니어 풀스택 개발자"
                        value={formData.targetJob}
                        onChange={(e) => setFormData({ ...formData, targetJob: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">산업 분야</Label>
                      <Input
                        id="industry"
                        placeholder="예: IT/테크"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experienceYears">경력 (년)</Label>
                      <Input
                        id="experienceYears"
                        type="number"
                        placeholder="예: 3"
                        value={formData.experienceYears}
                        onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goals">경력 목표</Label>
                    <Textarea
                      id="goals"
                      placeholder="멘토링을 통해 달성하고 싶은 목표를 구체적으로 작성해주세요"
                      value={formData.goals}
                      onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="challenges">현재 직면한 도전</Label>
                    <Textarea
                      id="challenges"
                      placeholder="현재 경력에서 겪고 있는 어려움이나 고민을 작성해주세요"
                      value={formData.challenges}
                      onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        분석 중...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        멘토 매칭 시작
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
                새로 분석하기
              </Button>

              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                  <TabsTrigger value="profile">이상적 멘토</TabsTrigger>
                  <TabsTrigger value="recommendations">추천 멘토</TabsTrigger>
                  <TabsTrigger value="outreach">연락 전략</TabsTrigger>
                  <TabsTrigger value="meeting">미팅 준비</TabsTrigger>
                  <TabsTrigger value="platforms">플랫폼</TabsTrigger>
                  <TabsTrigger value="action">실행 계획</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        이상적인 멘토 프로필
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">추천 직책</p>
                          <p className="font-semibold text-foreground">{result.idealMentorProfile.title}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">산업 분야</p>
                          <p className="font-semibold text-foreground">{result.idealMentorProfile.industry}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">경력 수준</p>
                          <p className="font-semibold text-foreground">{result.idealMentorProfile.experienceLevel}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">핵심 기술</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.idealMentorProfile.keySkills.map((skill, i) => (
                            <Badge key={i} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">멘토 특성</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.idealMentorProfile.characteristics.map((char, i) => (
                            <Badge key={i} variant="outline">{char}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="mt-6 space-y-4">
                  {result.recommendedMentors.map((mentor, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge className="mb-2">{mentor.type}</Badge>
                            <CardTitle className="text-lg">{mentor.title}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">왜 이 멘토인가?</h4>
                          <p className="text-muted-foreground">{mentor.why}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">배울 수 있는 것</h4>
                          <ul className="space-y-1">
                            {mentor.whatToLearn.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              찾을 수 있는 곳
                            </p>
                            <p className="text-sm text-muted-foreground">{mentor.whereToFind}</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              접근 팁
                            </p>
                            <p className="text-sm text-muted-foreground">{mentor.approachTip}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="outreach" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        연락 전략
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">이메일 제목 예시</p>
                        <p className="font-semibold text-foreground">{result.outreachStrategy.subjectLine}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">메시지 템플릿</h4>
                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                          <p className="text-muted-foreground whitespace-pre-wrap">{result.outreachStrategy.messageTemplate}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">꼭 언급해야 할 포인트</h4>
                        <ul className="space-y-2">
                          {result.outreachStrategy.keyPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">피해야 할 실수</h4>
                        <ul className="space-y-2">
                          {result.outreachStrategy.commonMistakes.map((mistake, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground">
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                              {mistake}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="meeting" className="mt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>질문 리스트</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {result.meetingPreparation.questionsToAsk.map((q, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <span className="text-muted-foreground">{q}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>토론 주제</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {result.meetingPreparation.topicsToDiscuss.map((topic, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground">
                              <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-green-600">해야 할 것</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {result.meetingPreparation.doAndDonts.do.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-red-600">하지 말아야 할 것</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {result.meetingPreparation.doAndDonts.dont.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground">
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        관계 구축
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">추천 미팅 빈도</p>
                          <p className="font-semibold text-foreground">{result.relationshipBuilding.frequency}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">멘토링 기간</p>
                          <p className="font-semibold text-foreground">{result.relationshipBuilding.duration}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-2">멘토에게 제공할 가치</h4>
                        <ul className="space-y-1">
                          {result.relationshipBuilding.valueExchange.map((v, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground">
                              <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              {v}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="platforms" className="mt-6 space-y-4">
                  {result.findingPlatforms.map((platform, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant="outline" className="mb-2">{platform.type}</Badge>
                            <CardTitle className="text-lg">{platform.platform}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-muted-foreground">{platform.description}</p>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            활용 팁
                          </p>
                          <p className="text-sm text-muted-foreground">{platform.tips}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="action" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>4주 실행 계획</CardTitle>
                      <CardDescription>단계별로 멘토를 찾고 관계를 구축하세요</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {[
                          { week: "1주차", tasks: result.actionPlan.week1, color: "bg-blue-500" },
                          { week: "2주차", tasks: result.actionPlan.week2, color: "bg-green-500" },
                          { week: "3주차", tasks: result.actionPlan.week3, color: "bg-yellow-500" },
                          { week: "4주차", tasks: result.actionPlan.week4, color: "bg-purple-500" },
                        ].map((week, index) => (
                          <div key={index} className="relative pl-8">
                            <div className={`absolute left-0 top-0 w-4 h-4 rounded-full ${week.color}`} />
                            {index < 3 && (
                              <div className="absolute left-[7px] top-4 w-0.5 h-full bg-border" />
                            )}
                            <h4 className="font-semibold text-foreground mb-3">{week.week}</h4>
                            <ul className="space-y-2">
                              {week.tasks.map((task, i) => (
                                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                  <CheckCircle className="w-4 h-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
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
