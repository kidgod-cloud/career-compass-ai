import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Compass, 
  LogOut, 
  Brain, 
  Target, 
  BarChart3, 
  Route, 
  Eye, 
  FileText,
  Linkedin,
  Mic,
  Palette,
  Star,
  Award,
  Network,
  Users,
  PenTool,
  Gift,
  Clock,
  TrendingUp,
  DollarSign,
  Lightbulb,
  BookOpen,
  ChevronRight,
  User,
  History
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { RoadmapProgress } from "@/components/dashboard/RoadmapProgress";
import { WeeklyTasks } from "@/components/dashboard/WeeklyTasks";

interface FeatureItem {
  id: string;
  icon: typeof Brain;
  title: string;
  description: string;
  category: string;
}

interface StrategyCounts {
  branding: number;
  content: number;
  networking: number;
}

interface RecentActivity {
  id: string;
  type: "branding" | "content" | "networking" | "roadmap";
  title: string;
  subtitle: string;
  created_at: string;
}

const features: FeatureItem[] = [
  { id: "roadmap", icon: Brain, title: "AI 경력 로드맵", description: "6개월 맞춤형 성장 계획", category: "strategy" },
  { id: "skills", icon: Target, title: "기술 격차 분석", description: "부족한 기술 파악", category: "strategy" },
  { id: "swot", icon: BarChart3, title: "경력 SWOT 분석", description: "강점, 약점, 기회, 위협", category: "strategy" },
  { id: "transition", icon: Route, title: "역할 전환 가이드", description: "60일 실행 계획", category: "strategy" },
  { id: "vision", icon: Eye, title: "커리어 비전 정렬", description: "3년 경력 비전", category: "strategy" },
  { id: "resume", icon: FileText, title: "AI 이력서 최적화", description: "ATS 호환 이력서", category: "resume" },
  { id: "linkedin", icon: Linkedin, title: "LinkedIn 프로필", description: "프로필 최적화", category: "resume" },
  { id: "interview", icon: Mic, title: "AI 면접 코치", description: "모의 면접 시뮬레이션", category: "resume" },
  { id: "portfolio", icon: Palette, title: "포트폴리오 빌더", description: "디지털 포트폴리오", category: "resume" },
  { id: "performance", icon: Star, title: "성과 평가 준비", description: "성과 요약", category: "resume" },
  { id: "branding", icon: Award, title: "AI 개인 브랜딩", description: "브랜드 선언문", category: "branding" },
  { id: "networking", icon: Network, title: "네트워킹 전략", description: "LinkedIn 네트워킹", category: "branding" },
  { id: "mentor", icon: Users, title: "AI 멘토 매치", description: "멘토 찾기", category: "branding" },
  { id: "content", icon: PenTool, title: "콘텐츠 전략", description: "게시물 아이디어", category: "branding" },
  { id: "deposit", icon: Gift, title: "네트워킹 입금", description: "네트워크 가치 추가", category: "branding" },
  { id: "time", icon: Clock, title: "시간 관리", description: "일상 루틴 설계", category: "productivity" },
  { id: "market", icon: TrendingUp, title: "시장 예측", description: "트렌드 분석", category: "productivity" },
  { id: "salary", icon: DollarSign, title: "급여 벤치마킹", description: "급여 비교", category: "productivity" },
  { id: "thought", icon: Lightbulb, title: "사고 리더십", description: "전문가 포지셔닝", category: "productivity" },
  { id: "learning", icon: BookOpen, title: "학습 경로", description: "30일 학습 계획", category: "productivity" },
];

const categories = [
  { id: "strategy", name: "경력 전략", emoji: "🧠" },
  { id: "resume", name: "이력서 & 면접", emoji: "📄" },
  { id: "branding", name: "개인 브랜딩", emoji: "🌐" },
  { id: "productivity", name: "생산성 & 시장", emoji: "📈" },
];

export default function Dashboard() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [strategyCounts, setStrategyCounts] = useState<StrategyCounts>({ branding: 0, content: 0, networking: 0 });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchStrategyCounts();
        fetchRecentActivities();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchStrategyCounts = async () => {
    try {
      const [brandingRes, contentRes, networkingRes] = await Promise.all([
        supabase.from("personal_branding_strategies").select("id", { count: "exact", head: true }),
        supabase.from("content_strategies").select("id", { count: "exact", head: true }),
        supabase.from("networking_strategies").select("id", { count: "exact", head: true }),
      ]);

      setStrategyCounts({
        branding: brandingRes.count || 0,
        content: contentRes.count || 0,
        networking: networkingRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching strategy counts:", error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const [brandingRes, contentRes, networkingRes, roadmapRes] = await Promise.all([
        supabase.from("personal_branding_strategies").select("id, job_title, target_role, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("content_strategies").select("id, target_audience, industry, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("networking_strategies").select("id, current_job, target_job, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("career_roadmaps").select("id, title, target_job, created_at").order("created_at", { ascending: false }).limit(3),
      ]);

      const activities: RecentActivity[] = [];

      brandingRes.data?.forEach((item) => {
        activities.push({
          id: item.id,
          type: "branding",
          title: "퍼스널 브랜딩 전략",
          subtitle: item.job_title + (item.target_role ? ` → ${item.target_role}` : ""),
          created_at: item.created_at,
        });
      });

      contentRes.data?.forEach((item) => {
        activities.push({
          id: item.id,
          type: "content",
          title: "콘텐츠 전략",
          subtitle: item.target_audience + (item.industry ? ` (${item.industry})` : ""),
          created_at: item.created_at,
        });
      });

      networkingRes.data?.forEach((item) => {
        activities.push({
          id: item.id,
          type: "networking",
          title: "네트워킹 전략",
          subtitle: item.current_job + (item.target_job ? ` → ${item.target_job}` : ""),
          created_at: item.created_at,
        });
      });

      roadmapRes.data?.forEach((item) => {
        activities.push({
          id: item.id,
          type: "roadmap",
          title: "경력 로드맵",
          subtitle: item.title + (item.target_job ? ` (${item.target_job})` : ""),
          created_at: item.created_at,
        });
      });

      // Sort by created_at and take top 5
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error("Error fetching recent activities:", error);
    }
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "로그아웃",
      description: "성공적으로 로그아웃되었습니다.",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Compass className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Career<span className="text-gradient">Shift</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <User className="w-4 h-4" />
                <span>{user?.user_metadata?.full_name || user?.email}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            안녕하세요, {user?.user_metadata?.full_name || "사용자"}님! 👋
          </h1>
          <p className="text-muted-foreground">
            오늘은 어떤 경력 개발을 시작해 볼까요?
          </p>
        </div>

        {/* Strategy History Summary */}
        {(strategyCounts.branding > 0 || strategyCounts.content > 0 || strategyCounts.networking > 0) && (
          <Card className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">저장된 전략</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-purple-500" />
                        브랜딩 {strategyCounts.branding}개
                      </span>
                      <span className="flex items-center gap-1">
                        <PenTool className="h-3.5 w-3.5 text-blue-500" />
                        콘텐츠 {strategyCounts.content}개
                      </span>
                      <span className="flex items-center gap-1">
                        <Network className="h-3.5 w-3.5 text-green-500" />
                        네트워킹 {strategyCounts.networking}개
                      </span>
                    </div>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/strategy-history" className="flex items-center gap-2">
                    전체 히스토리 보기
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roadmap Progress */}
        <RoadmapProgress />

        {/* Weekly Tasks */}
        <WeeklyTasks />

        {/* Recent Activity Timeline */}
        {recentActivities.length > 0 && (
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                최근 활동
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const getActivityIcon = () => {
                    switch (activity.type) {
                      case "branding": return <Award className="h-4 w-4 text-purple-500" />;
                      case "content": return <PenTool className="h-4 w-4 text-blue-500" />;
                      case "networking": return <Network className="h-4 w-4 text-green-500" />;
                      case "roadmap": return <Brain className="h-4 w-4 text-orange-500" />;
                    }
                  };

                  const getActivityLink = () => {
                    switch (activity.type) {
                      case "branding": return "/personal-branding";
                      case "content": return "/content-strategy";
                      case "networking": return "/networking-strategy";
                      case "roadmap": return "/roadmap";
                    }
                  };

                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="relative">
                        <div className="p-2 bg-muted rounded-full">
                          {getActivityIcon()}
                        </div>
                        {index < recentActivities.length - 1 && (
                          <div className="absolute left-1/2 top-full w-px h-4 bg-border -translate-x-1/2" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm text-foreground">{activity.title}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ko })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{activity.subtitle}</p>
                      </div>
                      <Button asChild variant="ghost" size="sm" className="shrink-0">
                        <Link to={getActivityLink()}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/strategy-history" className="flex items-center gap-2">
                    모든 활동 보기
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feature categories */}
        {categories.map((category) => (
          <section key={category.id} className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">{category.emoji}</span>
              <h2 className="text-xl font-bold text-foreground">{category.name}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {features
                .filter((f) => f.category === category.id)
                .map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <button
                      key={feature.id}
                      onClick={() => {
                        if (feature.id === "roadmap") {
                          navigate("/roadmap");
                        } else if (feature.id === "skills") {
                          navigate("/skill-analysis");
                        } else if (feature.id === "swot") {
                          navigate("/swot-analysis");
                        } else if (feature.id === "resume") {
                          navigate("/resume-optimization");
                        } else if (feature.id === "transition") {
                          navigate("/role-transition");
                        } else if (feature.id === "interview") {
                          navigate("/interview-coach");
                        } else if (feature.id === "vision") {
                          navigate("/career-vision");
                        } else if (feature.id === "linkedin") {
                          navigate("/linkedin-optimization");
                        } else if (feature.id === "portfolio") {
                          navigate("/portfolio-builder");
                        } else if (feature.id === "learning") {
                          navigate("/learning-path");
                        } else if (feature.id === "salary") {
                          navigate("/salary-benchmark");
                        } else if (feature.id === "time") {
                          navigate("/time-management");
                        } else if (feature.id === "mentor") {
                          navigate("/mentor-match");
                        } else if (feature.id === "content") {
                          navigate("/content-strategy");
                        } else if (feature.id === "networking") {
                          navigate("/networking-strategy");
                        } else if (feature.id === "branding") {
                          navigate("/personal-branding");
                        }
                      }}
                      className="group p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-card transition-all duration-300 text-left"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </button>
                  );
                })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
