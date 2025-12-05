import { FeatureCard } from "@/components/FeatureCard";
import {
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
  LucideIcon,
} from "lucide-react";

type ColorType = "cyan" | "teal" | "emerald" | "amber" | "violet";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: ColorType;
}

const strategyFeatures: Feature[] = [
  {
    icon: Brain,
    title: "AI 경력 로드맵",
    description: "현재 역할과 목표 직책을 기반으로 6개월 맞춤형 성장 계획을 만들어 보세요.",
    color: "cyan",
  },
  {
    icon: Target,
    title: "기술 격차 분석",
    description: "부족한 기술을 파악하고 격차를 메우기 위한 실질적인 제안을 받으세요.",
    color: "teal",
  },
  {
    icon: BarChart3,
    title: "경력 SWOT 분석",
    description: "자신의 강점, 약점, 기회, 위협을 파악하고 이를 바탕으로 어떻게 행동할지 알아보세요.",
    color: "emerald",
  },
  {
    icon: Route,
    title: "역할 전환 가이드",
    description: "60일 실행 계획과 인증 로드맵을 통해 새로운 분야로의 전환을 계획해 보세요.",
    color: "cyan",
  },
  {
    icon: Eye,
    title: "커리어 비전 정렬",
    description: "3년 단위의 경력 비전을 정의하고 이를 업계 동향과 개인의 강점에 맞춰 조정하세요.",
    color: "teal",
  },
];

const resumeFeatures: Feature[] = [
  {
    icon: FileText,
    title: "AI 이력서 최적화",
    description: "명확성, 영향력, ATS 호환성을 고려하여 이력서를 다시 작성하세요.",
    color: "amber",
  },
  {
    icon: Linkedin,
    title: "LinkedIn 프로필 메이크오버",
    description: "채용 담당자의 관심을 끌기 위해 요약과 경험 섹션을 개편하세요.",
    color: "cyan",
  },
  {
    icon: Mic,
    title: "AI 면접 코치",
    description: "모의 면접을 시뮬레이션하고 명확성과 자신감에 대한 피드백을 받으세요.",
    color: "violet",
  },
  {
    icon: Palette,
    title: "포트폴리오 빌더",
    description: "귀하의 주요 프로젝트와 성과를 보여주는 디지털 포트폴리오를 디자인하세요.",
    color: "teal",
  },
  {
    icon: Star,
    title: "성과 평가 준비",
    description: "연간 성과를 짧고 자세하고 리더십에 초점을 맞춘 버전으로 요약해 보세요.",
    color: "emerald",
  },
];

const brandingFeatures: Feature[] = [
  {
    icon: Award,
    title: "AI 개인 브랜딩",
    description: "틈새 시장에 대한 브랜드 선언문과 포지셔닝 전략을 만들어 보세요.",
    color: "violet",
  },
  {
    icon: Network,
    title: "AI와의 네트워킹 전략",
    description: "메시지 템플릿과 참여 아이디어를 활용해 LinkedIn 네트워킹 계획을 세워보세요.",
    color: "cyan",
  },
  {
    icon: Users,
    title: "AI 멘토 매치",
    description: "적합한 멘토를 찾아 의미 있는 관계를 구축하는 방법을 배워보세요.",
    color: "teal",
  },
  {
    icon: PenTool,
    title: "AI 기반 콘텐츠 전략",
    description: "영향력을 키우고 전문 지식을 공유하기 위해 LinkedIn 게시물 아이디어 10개를 생성하세요.",
    color: "amber",
  },
  {
    icon: Gift,
    title: "AI 네트워킹 입금",
    description: "개인화된 메시지, 리소스, 참여 전략을 통해 네트워크에 가치를 더하세요.",
    color: "emerald",
  },
];

const productivityFeatures: Feature[] = [
  {
    icon: Clock,
    title: "시간 관리 시스템",
    description: "Notion AI와 Motion 같은 도구를 활용해 집중력을 유지하는 일상 루틴을 만들어보세요.",
    color: "cyan",
  },
  {
    icon: TrendingUp,
    title: "일자리 시장 예측",
    description: "향후 2년 동안 업계에서 떠오르는 역할과 트렌드를 분석해 보세요.",
    color: "teal",
  },
  {
    icon: DollarSign,
    title: "AI 급여 벤치마킹",
    description: "귀하의 급여를 업계 표준과 비교하고 협상 전략을 알아보세요.",
    color: "emerald",
  },
  {
    icon: Lightbulb,
    title: "사고 리더십 개발",
    description: "해당 분야의 전문가로서 자리매김하기 위한 4주 계획을 세워보세요.",
    color: "amber",
  },
  {
    icon: BookOpen,
    title: "개인화된 학습 경로",
    description: "당신의 꿈의 역할에 맞춰 코스, 프로젝트, 연습문제로 구성된 30일 학습 계획을 설계해보세요.",
    color: "violet",
  },
];

interface FeatureSectionProps {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  features: Feature[];
}

function FeatureSection({ id, title, subtitle, emoji, features }: FeatureSectionProps) {
  return (
    <section id={id} className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-4xl mb-4 block">{emoji}</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
              color={feature.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <div id="features" className="bg-background">
      <FeatureSection
        id="strategy"
        title="경력 전략 및 계획"
        subtitle="AI가 분석한 맞춤형 경력 전략으로 체계적인 성장을 설계하세요"
        emoji="🧠"
        features={strategyFeatures}
      />
      
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <FeatureSection
        id="resume"
        title="이력서, 포트폴리오 및 면접 준비"
        subtitle="채용 담당자의 눈길을 사로잡는 완벽한 지원 서류를 준비하세요"
        emoji="📄"
        features={resumeFeatures}
      />
      
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <FeatureSection
        id="branding"
        title="개인 브랜딩 및 네트워킹"
        subtitle="업계에서 인정받는 전문가로 자리매김하세요"
        emoji="🌐"
        features={brandingFeatures}
      />
      
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <FeatureSection
        id="productivity"
        title="생산성, 시장 동향 및 급여 통찰력"
        subtitle="데이터 기반 인사이트로 경쟁력을 높이세요"
        emoji="📈"
        features={productivityFeatures}
      />
    </div>
  );
}
