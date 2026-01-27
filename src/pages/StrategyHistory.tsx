import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, PenTool, Users, Trash2, Calendar, Eye, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface PersonalBrandingStrategy {
  id: string;
  job_title: string;
  target_role: string | null;
  industry: string | null;
  strategy: any;
  created_at: string;
}

interface ContentStrategy {
  id: string;
  target_audience: string;
  industry: string | null;
  expertise: string | null;
  strategy: any;
  created_at: string;
}

interface NetworkingStrategy {
  id: string;
  current_job: string;
  target_job: string | null;
  industry: string | null;
  strategy: any;
  created_at: string;
}

export default function StrategyHistory() {
  const [personalBrandingStrategies, setPersonalBrandingStrategies] = useState<PersonalBrandingStrategy[]>([]);
  const [contentStrategies, setContentStrategies] = useState<ContentStrategy[]>([]);
  const [networkingStrategies, setNetworkingStrategies] = useState<NetworkingStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<{ type: string; data: any } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchAllStrategies();
    };
    checkAuthAndFetch();
  }, [navigate]);

  const fetchAllStrategies = async () => {
    setIsLoading(true);
    try {
      const [brandingRes, contentRes, networkingRes] = await Promise.all([
        supabase.from("personal_branding_strategies").select("*").order("created_at", { ascending: false }),
        supabase.from("content_strategies").select("*").order("created_at", { ascending: false }),
        supabase.from("networking_strategies").select("*").order("created_at", { ascending: false }),
      ]);

      if (brandingRes.data) setPersonalBrandingStrategies(brandingRes.data);
      if (contentRes.data) setContentStrategies(contentRes.data);
      if (networkingRes.data) setNetworkingStrategies(networkingRes.data);
    } catch (error) {
      console.error("Error fetching strategies:", error);
      toast({
        title: "오류",
        description: "전략 히스토리를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStrategy = async (type: string, id: string) => {
    try {
      const tableName = type === "branding" 
        ? "personal_branding_strategies" 
        : type === "content" 
        ? "content_strategies" 
        : "networking_strategies";

      const { error } = await supabase.from(tableName).delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "전략이 삭제되었습니다.",
      });

      fetchAllStrategies();
      if (selectedStrategy?.data.id === id) {
        setSelectedStrategy(null);
      }
    } catch (error) {
      console.error("Error deleting strategy:", error);
      toast({
        title: "오류",
        description: "전략 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const totalStrategies = personalBrandingStrategies.length + contentStrategies.length + networkingStrategies.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            대시보드로 돌아가기
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">전략 히스토리</h1>
              <p className="text-muted-foreground">저장된 모든 전략을 한눈에 확인하세요</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Award className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{personalBrandingStrategies.length}</p>
                <p className="text-sm text-muted-foreground">퍼스널 브랜딩</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <PenTool className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{contentStrategies.length}</p>
                <p className="text-sm text-muted-foreground">콘텐츠 전략</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{networkingStrategies.length}</p>
                <p className="text-sm text-muted-foreground">네트워킹 전략</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {totalStrategies === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">저장된 전략이 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                퍼스널 브랜딩, 콘텐츠, 네트워킹 전략을 생성하고 저장해보세요.
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button asChild variant="outline">
                  <Link to="/personal-branding">퍼스널 브랜딩</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/content-strategy">콘텐츠 전략</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/networking-strategy">네트워킹 전략</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="all" className="flex-1">전체 ({totalStrategies})</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4 max-h-[600px] overflow-y-auto">
                  {personalBrandingStrategies.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Award className="h-4 w-4" /> 퍼스널 브랜딩
                      </h3>
                      {personalBrandingStrategies.map((strategy) => (
                        <Card 
                          key={strategy.id} 
                          className={`cursor-pointer hover:border-primary/50 transition-colors ${selectedStrategy?.data.id === strategy.id ? 'border-primary' : ''}`}
                          onClick={() => setSelectedStrategy({ type: "branding", data: strategy })}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{strategy.job_title}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {strategy.target_role && `→ ${strategy.target_role}`}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(strategy.created_at), "yyyy.MM.dd HH:mm", { locale: ko })}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteStrategy("branding", strategy.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {contentStrategies.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <PenTool className="h-4 w-4" /> 콘텐츠 전략
                      </h3>
                      {contentStrategies.map((strategy) => (
                        <Card 
                          key={strategy.id} 
                          className={`cursor-pointer hover:border-primary/50 transition-colors ${selectedStrategy?.data.id === strategy.id ? 'border-primary' : ''}`}
                          onClick={() => setSelectedStrategy({ type: "content", data: strategy })}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{strategy.target_audience}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {strategy.industry || "산업 미지정"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(strategy.created_at), "yyyy.MM.dd HH:mm", { locale: ko })}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteStrategy("content", strategy.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {networkingStrategies.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" /> 네트워킹 전략
                      </h3>
                      {networkingStrategies.map((strategy) => (
                        <Card 
                          key={strategy.id} 
                          className={`cursor-pointer hover:border-primary/50 transition-colors ${selectedStrategy?.data.id === strategy.id ? 'border-primary' : ''}`}
                          onClick={() => setSelectedStrategy({ type: "networking", data: strategy })}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{strategy.current_job}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {strategy.target_job && `→ ${strategy.target_job}`}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(strategy.created_at), "yyyy.MM.dd HH:mm", { locale: ko })}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteStrategy("networking", strategy.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-2">
              {selectedStrategy ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {selectedStrategy.type === "branding" && <Award className="h-5 w-5 text-purple-500" />}
                      {selectedStrategy.type === "content" && <PenTool className="h-5 w-5 text-blue-500" />}
                      {selectedStrategy.type === "networking" && <Users className="h-5 w-5 text-green-500" />}
                      <Badge variant="outline">
                        {selectedStrategy.type === "branding" && "퍼스널 브랜딩"}
                        {selectedStrategy.type === "content" && "콘텐츠 전략"}
                        {selectedStrategy.type === "networking" && "네트워킹 전략"}
                      </Badge>
                    </div>
                    <CardTitle>
                      {selectedStrategy.type === "branding" && selectedStrategy.data.job_title}
                      {selectedStrategy.type === "content" && selectedStrategy.data.target_audience}
                      {selectedStrategy.type === "networking" && selectedStrategy.data.current_job}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(selectedStrategy.data.created_at), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-[500px] overflow-y-auto">
                    <StrategyDetail type={selectedStrategy.type} strategy={selectedStrategy.data.strategy} />
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center">
                    <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">전략을 선택하세요</h3>
                    <p className="text-muted-foreground">
                      왼쪽 목록에서 전략을 클릭하면 상세 내용을 볼 수 있습니다.
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
}

function StrategyDetail({ type, strategy }: { type: string; strategy: any }) {
  if (type === "branding") {
    return (
      <div className="space-y-6">
        {strategy.brandStatement && (
          <div>
            <h4 className="font-semibold mb-2">브랜드 스테이트먼트</h4>
            <p className="text-sm"><strong>헤드라인:</strong> {strategy.brandStatement.headline}</p>
            <p className="text-sm"><strong>엘리베이터 피치:</strong> {strategy.brandStatement.elevator_pitch}</p>
            <p className="text-sm"><strong>태그라인:</strong> {strategy.brandStatement.tagline}</p>
          </div>
        )}
        {strategy.uniqueValueProposition && (
          <div>
            <h4 className="font-semibold mb-2">고유 가치 제안</h4>
            <p className="text-sm">{strategy.uniqueValueProposition.main}</p>
          </div>
        )}
        {strategy.brandPersonality && (
          <div>
            <h4 className="font-semibold mb-2">브랜드 성격</h4>
            <div className="flex flex-wrap gap-1">
              {strategy.brandPersonality.traits?.map((trait: string, i: number) => (
                <Badge key={i} variant="secondary">{trait}</Badge>
              ))}
            </div>
          </div>
        )}
        {strategy.onlinePresence && (
          <div>
            <h4 className="font-semibold mb-2">온라인 프레젠스</h4>
            <p className="text-sm"><strong>LinkedIn 헤드라인:</strong> {strategy.onlinePresence.linkedin_headline}</p>
            <p className="text-sm mt-2"><strong>짧은 소개:</strong> {strategy.onlinePresence.bio_short}</p>
          </div>
        )}
      </div>
    );
  }

  if (type === "content") {
    return (
      <div className="space-y-6">
        {strategy.contentStrategy && (
          <div>
            <h4 className="font-semibold mb-2">콘텐츠 전략</h4>
            <p className="text-sm"><strong>포지셔닝:</strong> {strategy.contentStrategy.positioning}</p>
            <p className="text-sm"><strong>고유 앵글:</strong> {strategy.contentStrategy.uniqueAngle}</p>
          </div>
        )}
        {strategy.contentPillars && (
          <div>
            <h4 className="font-semibold mb-2">콘텐츠 필러</h4>
            <div className="space-y-2">
              {strategy.contentPillars.map((pillar: any, i: number) => (
                <div key={i} className="p-2 bg-muted rounded">
                  <p className="font-medium text-sm">{pillar.pillar} ({pillar.percentage}%)</p>
                  <p className="text-xs text-muted-foreground">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {strategy.hashtagStrategy && (
          <div>
            <h4 className="font-semibold mb-2">해시태그 전략</h4>
            <div className="flex flex-wrap gap-1">
              {strategy.hashtagStrategy.primary?.map((tag: string, i: number) => (
                <Badge key={i} variant="outline">#{tag}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === "networking") {
    return (
      <div className="space-y-6">
        {strategy.networkingProfile && (
          <div>
            <h4 className="font-semibold mb-2">네트워킹 프로필</h4>
            <p className="text-sm"><strong>스타일:</strong> {strategy.networkingProfile.networkingStyle}</p>
            <p className="text-sm"><strong>고유 가치:</strong> {strategy.networkingProfile.uniqueValue}</p>
            <div className="mt-2">
              <p className="text-sm font-medium">강점:</p>
              <div className="flex flex-wrap gap-1">
                {strategy.networkingProfile.currentStrengths?.map((s: string, i: number) => (
                  <Badge key={i} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}
        {strategy.targetAudience && (
          <div>
            <h4 className="font-semibold mb-2">타겟 오디언스</h4>
            <div className="space-y-2">
              {strategy.targetAudience.map((target: any, i: number) => (
                <div key={i} className="p-2 bg-muted rounded">
                  <p className="font-medium text-sm">{target.type}</p>
                  <p className="text-xs text-muted-foreground">{target.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {strategy.thirtyDayPlan && (
          <div>
            <h4 className="font-semibold mb-2">30일 플랜</h4>
            <div className="space-y-2">
              {Object.entries(strategy.thirtyDayPlan).map(([week, data]: [string, any]) => (
                <div key={week} className="p-2 bg-muted rounded">
                  <p className="font-medium text-sm">{week.toUpperCase()}: {data.focus}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return <p className="text-muted-foreground">전략 상세 정보를 표시할 수 없습니다.</p>;
}
