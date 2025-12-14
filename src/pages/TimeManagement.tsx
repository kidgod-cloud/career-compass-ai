import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock, Target, Calendar, Zap, Brain, ArrowLeft, Sun, Moon, Coffee, Lightbulb, CheckCircle2 } from "lucide-react";

const TimeManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scheduleData, setScheduleData] = useState<any>(null);

  const [currentRoutine, setCurrentRoutine] = useState("");
  const [goals, setGoals] = useState("");
  const [challenges, setChallenges] = useState("");
  const [workStyle, setWorkStyle] = useState("");
  const [priorityAreas, setPriorityAreas] = useState<string[]>([]);

  const priorityOptions = [
    { id: "career", label: "커리어 성장" },
    { id: "health", label: "건강/운동" },
    { id: "learning", label: "자기계발/학습" },
    { id: "relationships", label: "인간관계" },
    { id: "hobbies", label: "취미/여가" },
    { id: "finances", label: "재정 관리" },
  ];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handlePriorityChange = (id: string, checked: boolean) => {
    if (checked) {
      setPriorityAreas([...priorityAreas, id]);
    } else {
      setPriorityAreas(priorityAreas.filter(p => p !== id));
    }
  };

  const handleGenerate = async () => {
    if (!currentRoutine || !goals || !workStyle || priorityAreas.length === 0) {
      toast({
        title: "입력 오류",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-schedule', {
        body: { currentRoutine, goals, challenges, workStyle, priorityAreas }
      });

      if (error) throw error;
      setScheduleData(data);
      toast({
        title: "분석 완료",
        description: "최적화된 시간 관리 시스템이 생성되었습니다.",
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "오류 발생",
        description: error.message || "일정 최적화 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">시간 관리 시스템</h1>
              <p className="text-sm text-muted-foreground">AI 기반 일정 최적화</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {!scheduleData ? (
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  일상 루틴 분석
                </CardTitle>
                <CardDescription>
                  현재 일상과 목표를 입력하면 AI가 최적화된 시간 관리 시스템을 제안합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="routine">현재 일상 루틴 *</Label>
                  <Textarea
                    id="routine"
                    placeholder="예: 아침 7시 기상, 8시 출근, 6시 퇴근, 저녁 식사 후 TV 시청, 밤 11시 취침..."
                    value={currentRoutine}
                    onChange={(e) => setCurrentRoutine(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">달성하고 싶은 목표 *</Label>
                  <Textarea
                    id="goals"
                    placeholder="예: 자격증 취득, 운동 습관 만들기, 사이드 프로젝트 진행..."
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="challenges">현재 겪고 있는 어려움</Label>
                  <Textarea
                    id="challenges"
                    placeholder="예: 집중력 부족, 미루는 습관, 피로감, 시간 부족..."
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>선호하는 업무 스타일 *</Label>
                  <Select value={workStyle} onValueChange={setWorkStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="업무 스타일을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">아침형 (새벽/아침에 집중)</SelectItem>
                      <SelectItem value="night">저녁형 (밤에 집중)</SelectItem>
                      <SelectItem value="flexible">유연형 (상황에 따라 조절)</SelectItem>
                      <SelectItem value="structured">체계형 (규칙적인 루틴 선호)</SelectItem>
                      <SelectItem value="burst">집중형 (짧은 시간 고집중)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>우선순위 영역 (최소 1개 선택) *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {priorityOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={priorityAreas.includes(option.id)}
                          onCheckedChange={(checked) => handlePriorityChange(option.id, checked as boolean)}
                        />
                        <label htmlFor={option.id} className="text-sm cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={generating}
                  className="w-full"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI가 분석 중입니다...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      최적화된 일정 생성하기
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">최적화된 시간 관리 시스템</h2>
                <Button variant="outline" onClick={() => setScheduleData(null)}>
                  다시 분석하기
                </Button>
              </div>

              {scheduleData.rawContent ? (
                <Card>
                  <CardContent className="pt-6">
                    <pre className="whitespace-pre-wrap text-sm">{scheduleData.rawContent}</pre>
                  </CardContent>
                </Card>
              ) : (
                <Tabs defaultValue="analysis" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="analysis">현재 분석</TabsTrigger>
                    <TabsTrigger value="daily">일일 일정</TabsTrigger>
                    <TabsTrigger value="weekly">주간 계획</TabsTrigger>
                    <TabsTrigger value="habits">습관 추천</TabsTrigger>
                    <TabsTrigger value="action">실행 계획</TabsTrigger>
                  </TabsList>

                  <TabsContent value="analysis" className="space-y-6">
                    {scheduleData.analysis && (
                      <>
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Brain className="h-5 w-5 text-primary" />
                              현재 상태 분석
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div>
                              <p className="text-muted-foreground">{scheduleData.analysis.currentState}</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium">생산성 점수</span>
                              <Progress value={scheduleData.analysis.productivityScore} className="flex-1" />
                              <span className="text-lg font-bold text-primary">{scheduleData.analysis.productivityScore}점</span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4" />
                                  강점
                                </h4>
                                <ul className="space-y-2">
                                  {scheduleData.analysis.strengths?.map((item: string, idx: number) => (
                                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="text-green-500">•</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="space-y-3">
                                <h4 className="font-semibold text-amber-600 dark:text-amber-400">개선 필요</h4>
                                <ul className="space-y-2">
                                  {scheduleData.analysis.weaknesses?.map((item: string, idx: number) => (
                                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="text-amber-500">•</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {scheduleData.analysis.timeWasters && (
                              <div className="space-y-3">
                                <h4 className="font-semibold text-red-600 dark:text-red-400">시간 낭비 요소</h4>
                                <div className="flex flex-wrap gap-2">
                                  {scheduleData.analysis.timeWasters.map((item: string, idx: number) => (
                                    <Badge key={idx} variant="destructive">{item}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {scheduleData.energyManagement && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                에너지 관리
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">최고 집중 시간</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {scheduleData.energyManagement.peakHours?.map((hour: string, idx: number) => (
                                      <Badge key={idx} className="bg-green-500/20 text-green-700 dark:text-green-300">{hour}</Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                  <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">휴식 권장 시간</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {scheduleData.energyManagement.lowEnergyHours?.map((hour: string, idx: number) => (
                                      <Badge key={idx} className="bg-blue-500/20 text-blue-700 dark:text-blue-300">{hour}</Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <ul className="space-y-2">
                                {scheduleData.energyManagement.recommendations?.map((rec: string, idx: number) => (
                                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="daily" className="space-y-6">
                    {scheduleData.optimizedSchedule && (
                      <div className="grid gap-6">
                        {scheduleData.optimizedSchedule.morningRoutine && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Sun className="h-5 w-5 text-yellow-500" />
                                아침 루틴
                                <Badge variant="outline">{scheduleData.optimizedSchedule.morningRoutine.timeBlock}</Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {scheduleData.optimizedSchedule.morningRoutine.activities?.map((activity: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                    <span className="text-sm font-mono text-primary">{activity.time}</span>
                                    <div className="flex-1">
                                      <p className="font-medium">{activity.activity}</p>
                                      <p className="text-sm text-muted-foreground">{activity.purpose}</p>
                                    </div>
                                    <Badge variant="secondary">{activity.duration}</Badge>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {scheduleData.optimizedSchedule.workBlocks && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-blue-500" />
                                업무 시간 블록
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {scheduleData.optimizedSchedule.workBlocks.map((block: any, idx: number) => (
                                  <div key={idx} className="p-4 rounded-lg border border-border">
                                    <div className="flex items-center justify-between mb-3">
                                      <Badge>{block.timeBlock}</Badge>
                                      <span className="text-sm font-medium text-primary">{block.focus}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">추천 기법: {block.technique}</p>
                                    <div className="flex flex-wrap gap-2">
                                      {block.tasks?.map((task: string, tidx: number) => (
                                        <Badge key={tidx} variant="outline">{task}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {scheduleData.optimizedSchedule.breakSchedule && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Coffee className="h-5 w-5 text-amber-500" />
                                휴식 시간
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid md:grid-cols-3 gap-3">
                                {scheduleData.optimizedSchedule.breakSchedule.map((breakItem: any, idx: number) => (
                                  <div key={idx} className="p-3 rounded-lg bg-muted/50 text-center">
                                    <p className="font-mono text-primary">{breakItem.time}</p>
                                    <p className="text-sm font-medium">{breakItem.activity}</p>
                                    <p className="text-xs text-muted-foreground">{breakItem.duration}</p>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {scheduleData.optimizedSchedule.eveningRoutine && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Moon className="h-5 w-5 text-indigo-500" />
                                저녁 루틴
                                <Badge variant="outline">{scheduleData.optimizedSchedule.eveningRoutine.timeBlock}</Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {scheduleData.optimizedSchedule.eveningRoutine.activities?.map((activity: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                    <span className="text-sm font-mono text-primary">{activity.time}</span>
                                    <div className="flex-1">
                                      <p className="font-medium">{activity.activity}</p>
                                      <p className="text-sm text-muted-foreground">{activity.purpose}</p>
                                    </div>
                                    <Badge variant="secondary">{activity.duration}</Badge>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="weekly" className="space-y-6">
                    {scheduleData.weeklyPlan && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            주간 테마 계획
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-3">
                            {Object.entries(scheduleData.weeklyPlan).map(([day, plan]: [string, any]) => {
                              const dayNames: Record<string, string> = {
                                monday: "월요일", tuesday: "화요일", wednesday: "수요일",
                                thursday: "목요일", friday: "금요일", saturday: "토요일", sunday: "일요일"
                              };
                              return (
                                <div key={day} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                                  <div className="w-20 text-center">
                                    <span className="font-semibold text-primary">{dayNames[day]}</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium">{plan.theme}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {plan.focusAreas?.map((area: string, idx: number) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">{area}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {scheduleData.productivityTips && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                            생산성 팁
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {scheduleData.productivityTips.map((tip: any, idx: number) => (
                              <div key={idx} className="p-4 rounded-lg bg-muted/50">
                                <Badge className="mb-2">{tip.category}</Badge>
                                <p className="font-medium">{tip.tip}</p>
                                <p className="text-sm text-muted-foreground mt-1">{tip.implementation}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="habits" className="space-y-6">
                    {scheduleData.habitRecommendations && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {scheduleData.habitRecommendations.map((habit: any, idx: number) => (
                          <Card key={idx}>
                            <CardHeader>
                              <CardTitle className="text-lg">{habit.habit}</CardTitle>
                              <CardDescription>{habit.benefit}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>빈도: {habit.frequency}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span>추천 시간: {habit.bestTime}</span>
                              </div>
                              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                                <p className="text-sm font-medium text-primary">작게 시작하기</p>
                                <p className="text-sm text-muted-foreground">{habit.startSmall}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {scheduleData.toolRecommendations && (
                      <Card>
                        <CardHeader>
                          <CardTitle>추천 도구</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {scheduleData.toolRecommendations.map((tool: any, idx: number) => (
                              <div key={idx} className="p-3 rounded-lg border border-border">
                                <p className="font-medium">{tool.tool}</p>
                                <p className="text-sm text-muted-foreground">{tool.purpose}</p>
                                <p className="text-sm text-primary mt-1">{tool.howToUse}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="action" className="space-y-6">
                    {scheduleData.actionPlan && (
                      <div className="grid md:grid-cols-3 gap-6">
                        <Card className="border-green-500/30 bg-green-500/5">
                          <CardHeader>
                            <CardTitle className="text-green-600 dark:text-green-400">즉시 실행</CardTitle>
                            <CardDescription>오늘부터 시작하세요</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {scheduleData.actionPlan.immediate?.map((item: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="border-blue-500/30 bg-blue-500/5">
                          <CardHeader>
                            <CardTitle className="text-blue-600 dark:text-blue-400">이번 주 목표</CardTitle>
                            <CardDescription>7일 내 달성</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {scheduleData.actionPlan.thisWeek?.map((item: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <Target className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="border-purple-500/30 bg-purple-500/5">
                          <CardHeader>
                            <CardTitle className="text-purple-600 dark:text-purple-400">이번 달 목표</CardTitle>
                            <CardDescription>30일 내 달성</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {scheduleData.actionPlan.thisMonth?.map((item: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TimeManagement;
