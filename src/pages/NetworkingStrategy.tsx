import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Users, Loader2, Target, MessageSquare, Calendar, TrendingUp, AlertCircle, CheckCircle, Save, History, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface NetworkingStrategyData {
  networkingProfile: {
    currentStrengths: string[];
    areasToImprove: string[];
    networkingStyle: string;
    uniqueValue: string;
  };
  targetAudience: Array<{
    type: string;
    description: string;
    whereToFind: string[];
    approachStrategy: string;
    valueExchange: string;
  }>;
  messageTemplates: {
    coldOutreach: {
      subject: string;
      message: string;
      followUp: string;
    };
    linkedInConnection: {
      connectionRequest: string;
      afterConnection: string;
    };
    eventFollowUp: {
      sameDay: string;
      oneWeekLater: string;
    };
    referralRequest: string;
  };
  engagementStrategies: Array<{
    platform: string;
    frequency: string;
    actions: string[];
    contentIdeas: string[];
    bestPractices: string[];
  }>;
  weeklyPlan: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    weekend: string[];
  };
  eventStrategy: {
    typesOfEvents: string[];
    preparationTips: string[];
    duringEventTips: string[];
    followUpProcess: string[];
  };
  relationshipMaintenance: {
    frequency: string;
    touchpointIdeas: string[];
    valueAddingActions: string[];
    trackingMethod: string;
  };
  networkingMistakes: string[];
  thirtyDayPlan: {
    week1: { focus: string; tasks: string[] };
    week2: { focus: string; tasks: string[] };
    week3: { focus: string; tasks: string[] };
    week4: { focus: string; tasks: string[] };
  };
  metrics: {
    weeklyGoals: {
      newConnections: number;
      meaningfulConversations: number;
      contentEngagement: number;
      eventsAttended: number;
    };
    monthlyGoals: {
      networkGrowth: number;
      informationalInterviews: number;
      referrals: number;
    };
  };
}

interface SavedStrategy {
  id: string;
  current_job: string;
  target_job: string | null;
  industry: string | null;
  created_at: string;
  strategy: NetworkingStrategyData;
}

const NetworkingStrategy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [strategy, setStrategy] = useState<NetworkingStrategyData | null>(null);
  const [savedStrategies, setSavedStrategies] = useState<SavedStrategy[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [formData, setFormData] = useState({
    currentJob: "",
    targetJob: "",
    industry: "",
    goals: "",
    networkingStyle: "",
    targetContacts: ""
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchSavedStrategies();
      }
    });
  }, [navigate]);

  const fetchSavedStrategies = async () => {
    const { data, error } = await supabase
      .from("networking_strategies")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSavedStrategies(data.map(item => ({
        ...item,
        strategy: item.strategy as unknown as NetworkingStrategyData
      })));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('networking-strategy', {
        body: formData
      });

      if (error) throw error;

      setStrategy(data);
      toast({
        title: "분석 완료",
        description: "네트워킹 전략이 생성되었습니다.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "오류 발생",
        description: "전략 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!strategy) return;
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("networking_strategies")
        .insert([{
          user_id: user.id,
          current_job: formData.currentJob,
          target_job: formData.targetJob,
          industry: formData.industry,
          goals: formData.goals,
          networking_style: formData.networkingStyle,
          target_contacts: formData.targetContacts,
          strategy: JSON.parse(JSON.stringify(strategy)),
        }]);

      if (error) throw error;

      toast({
        title: "저장 완료",
        description: "네트워킹 전략이 저장되었습니다.",
      });
      fetchSavedStrategies();
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "저장 실패",
        description: "저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("networking_strategies")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "전략이 삭제되었습니다.",
      });
      fetchSavedStrategies();
    } catch (error) {
      console.error("Error deleting:", error);
      toast({
        title: "삭제 실패",
        description: "삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleLoadStrategy = (saved: SavedStrategy) => {
    setStrategy(saved.strategy);
    setFormData({
      currentJob: saved.current_job,
      targetJob: saved.target_job || "",
      industry: saved.industry || "",
      goals: "",
      networkingStyle: "",
      targetContacts: ""
    });
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            대시보드로 돌아가기
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="w-4 h-4 mr-2" />
            {showHistory ? "전략 생성" : "히스토리"}
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            AI 네트워킹 전략
          </h1>
          <p className="text-muted-foreground mt-2">
            효과적인 네트워킹 방법과 메시지 템플릿을 AI가 제안합니다
          </p>
        </div>

        {showHistory ? (
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                저장된 네트워킹 전략
              </CardTitle>
              <CardDescription>
                이전에 생성한 네트워킹 전략을 확인하고 불러올 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedStrategies.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  저장된 전략이 없습니다.
                </p>
              ) : (
                <div className="space-y-4">
                  {savedStrategies.map((saved) => (
                    <div
                      key={saved.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {saved.current_job} → {saved.target_job}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {saved.industry} • {format(new Date(saved.created_at), "yyyy년 M월 d일", { locale: ko })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadStrategy(saved)}
                        >
                          불러오기
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(saved.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>네트워킹 정보 입력</CardTitle>
                <CardDescription>
                  맞춤형 전략을 위해 정보를 입력하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentJob">현재 직무</Label>
                    <Input
                      id="currentJob"
                      placeholder="예: 마케팅 매니저"
                      value={formData.currentJob}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentJob: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetJob">목표 직무</Label>
                    <Input
                      id="targetJob"
                      placeholder="예: CMO"
                      value={formData.targetJob}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetJob: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">산업 분야</Label>
                    <Input
                      id="industry"
                      placeholder="예: 테크 스타트업"
                      value={formData.industry}
                      onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goals">네트워킹 목표</Label>
                    <Textarea
                      id="goals"
                      placeholder="예: 업계 리더들과 연결, 멘토 찾기, 이직 기회 탐색"
                      value={formData.goals}
                      onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="networkingStyle">선호하는 네트워킹 스타일</Label>
                    <Select
                      value={formData.networkingStyle}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, networkingStyle: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="스타일 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="온라인 중심">온라인 중심</SelectItem>
                        <SelectItem value="오프라인 중심">오프라인 중심</SelectItem>
                        <SelectItem value="하이브리드">하이브리드</SelectItem>
                        <SelectItem value="1:1 미팅 선호">1:1 미팅 선호</SelectItem>
                        <SelectItem value="그룹 이벤트 선호">그룹 이벤트 선호</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetContacts">타겟 연락처 유형</Label>
                    <Textarea
                      id="targetContacts"
                      placeholder="예: C레벨 임원, 스타트업 창업자, 업계 인플루언서"
                      value={formData.targetContacts}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetContacts: e.target.value }))}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        분석 중...
                      </>
                    ) : (
                      "전략 생성하기"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              {strategy ? (
                <>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStrategy(null)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      새로 생성하기
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      저장하기
                    </Button>
                  </div>

                  {/* 네트워킹 프로필 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        네트워킹 프로필
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">네트워킹 스타일</h4>
                        <p className="text-foreground">{strategy.networkingProfile.networkingStyle}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">고유 가치</h4>
                        <p className="text-foreground">{strategy.networkingProfile.uniqueValue}</p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">강점</h4>
                          <ul className="space-y-1">
                            {strategy.networkingProfile.currentStrengths.map((strength, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">개선 영역</h4>
                          <ul className="space-y-1">
                            {strategy.networkingProfile.areasToImprove.map((area, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <TrendingUp className="h-4 w-4 text-orange-500" />
                                {area}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 타겟 오디언스 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        타겟 오디언스
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {strategy.targetAudience.map((target, idx) => (
                          <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold text-foreground mb-2">{target.type}</h4>
                            <p className="text-sm text-muted-foreground mb-3">{target.description}</p>
                            <div className="grid md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium">찾을 수 있는 곳:</span>
                                <p className="text-muted-foreground">{target.whereToFind.join(", ")}</p>
                              </div>
                              <div>
                                <span className="font-medium">접근 전략:</span>
                                <p className="text-muted-foreground">{target.approachStrategy}</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="font-medium text-sm">가치 교환:</span>
                              <p className="text-sm text-muted-foreground">{target.valueExchange}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 메시지 템플릿 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        메시지 템플릿
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">콜드 아웃리치</h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">제목</p>
                            <p className="text-sm">{strategy.messageTemplates.coldOutreach.subject}</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">메시지</p>
                            <p className="text-sm whitespace-pre-wrap">{strategy.messageTemplates.coldOutreach.message}</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">후속 메시지</p>
                            <p className="text-sm whitespace-pre-wrap">{strategy.messageTemplates.coldOutreach.followUp}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">LinkedIn 연결</h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">연결 요청</p>
                            <p className="text-sm">{strategy.messageTemplates.linkedInConnection.connectionRequest}</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">연결 후</p>
                            <p className="text-sm">{strategy.messageTemplates.linkedInConnection.afterConnection}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">이벤트 후속</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">당일</p>
                            <p className="text-sm">{strategy.messageTemplates.eventFollowUp.sameDay}</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">1주일 후</p>
                            <p className="text-sm">{strategy.messageTemplates.eventFollowUp.oneWeekLater}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">추천 요청</h4>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{strategy.messageTemplates.referralRequest}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 참여 전략 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        플랫폼별 참여 전략
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {strategy.engagementStrategies.map((platform, idx) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-foreground">{platform.platform}</h4>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {platform.frequency}
                              </span>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">활동</p>
                                <div className="flex flex-wrap gap-1">
                                  {platform.actions.map((action, i) => (
                                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{action}</span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">콘텐츠 아이디어</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {platform.contentIdeas.map((idea, i) => (
                                    <li key={i}>• {idea}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 주간 계획 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        주간 네트워킹 계획
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(strategy.weeklyPlan).map(([day, tasks]) => (
                          <div key={day} className="p-3 bg-muted/50 rounded-lg">
                            <h4 className="font-medium text-foreground capitalize mb-2">
                              {day === 'monday' ? '월요일' : 
                               day === 'tuesday' ? '화요일' : 
                               day === 'wednesday' ? '수요일' : 
                               day === 'thursday' ? '목요일' : 
                               day === 'friday' ? '금요일' : '주말'}
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {tasks.map((task, i) => (
                                <li key={i}>• {task}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 30일 계획 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        30일 액션 플랜
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(strategy.thirtyDayPlan).map(([week, plan]) => (
                          <div key={week} className="p-4 border rounded-lg">
                            <h4 className="font-semibold text-foreground mb-1">
                              {week === 'week1' ? '1주차' : 
                               week === 'week2' ? '2주차' : 
                               week === 'week3' ? '3주차' : '4주차'}
                            </h4>
                            <p className="text-sm text-primary mb-2">{plan.focus}</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {plan.tasks.map((task, i) => (
                                <li key={i}>• {task}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 피해야 할 실수 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        피해야 할 네트워킹 실수
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {strategy.networkingMistakes.map((mistake, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            {mistake}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* 목표 지표 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        목표 지표
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-foreground mb-3">주간 목표</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-muted/50 rounded-lg text-center">
                              <p className="text-2xl font-bold text-primary">{strategy.metrics.weeklyGoals.newConnections}</p>
                              <p className="text-xs text-muted-foreground">새 연결</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg text-center">
                              <p className="text-2xl font-bold text-primary">{strategy.metrics.weeklyGoals.meaningfulConversations}</p>
                              <p className="text-xs text-muted-foreground">의미 있는 대화</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg text-center">
                              <p className="text-2xl font-bold text-primary">{strategy.metrics.weeklyGoals.contentEngagement}</p>
                              <p className="text-xs text-muted-foreground">콘텐츠 참여</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg text-center">
                              <p className="text-2xl font-bold text-primary">{strategy.metrics.weeklyGoals.eventsAttended}</p>
                              <p className="text-xs text-muted-foreground">이벤트 참석</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-3">월간 목표</h4>
                          <div className="grid gap-3">
                            <div className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">네트워크 성장</span>
                              <span className="font-bold text-primary">{strategy.metrics.monthlyGoals.networkGrowth}명</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">정보 인터뷰</span>
                              <span className="font-bold text-primary">{strategy.metrics.monthlyGoals.informationalInterviews}회</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">추천/소개</span>
                              <span className="font-bold text-primary">{strategy.metrics.monthlyGoals.referrals}건</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="h-full flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      네트워킹 전략 생성하기
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      왼쪽 양식에 정보를 입력하고 "전략 생성하기" 버튼을 클릭하세요.
                      AI가 맞춤형 네트워킹 전략을 제안해드립니다.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkingStrategy;
