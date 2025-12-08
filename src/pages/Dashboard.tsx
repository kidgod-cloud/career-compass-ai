import { Button } from "@/components/ui/button";
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
  User
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface FeatureItem {
  id: string;
  icon: typeof Brain;
  title: string;
  description: string;
  category: string;
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
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user?.user_metadata?.full_name || user?.email}</span>
              </div>
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
