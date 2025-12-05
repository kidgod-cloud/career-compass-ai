import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient">
      {/* Background effects */}
      <div className="absolute inset-0 bg-glow opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      
      {/* Floating elements */}
      <div className="absolute top-32 left-20 hidden lg:block animate-float">
        <div className="p-4 rounded-2xl bg-card/10 backdrop-blur-sm border border-primary/20">
          <Target className="w-8 h-8 text-cyan" />
        </div>
      </div>
      <div className="absolute top-40 right-32 hidden lg:block animate-float" style={{ animationDelay: "1s" }}>
        <div className="p-4 rounded-2xl bg-card/10 backdrop-blur-sm border border-accent/20">
          <TrendingUp className="w-8 h-8 text-teal" />
        </div>
      </div>
      <div className="absolute bottom-40 left-32 hidden lg:block animate-float" style={{ animationDelay: "2s" }}>
        <div className="p-4 rounded-2xl bg-card/10 backdrop-blur-sm border border-emerald/20">
          <Sparkles className="w-8 h-8 text-emerald" />
        </div>
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI 기반 커리어 전환 플랫폼</span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            당신의 경력 전환을
            <br />
            <span className="text-gradient">AI와 함께</span> 설계하세요
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            맞춤형 로드맵, 기술 격차 분석, 이력서 최적화까지.
            <br />
            20가지 AI 도구로 성공적인 경력 전환을 실현하세요.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="group">
                무료로 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="hero-outline" size="xl">
                기능 살펴보기
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">20+</div>
              <div className="text-sm text-primary-foreground/60">AI 도구</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">6개월</div>
              <div className="text-sm text-primary-foreground/60">맞춤 로드맵</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">24/7</div>
              <div className="text-sm text-primary-foreground/60">AI 코칭</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto fill-background">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
        </svg>
      </div>
    </section>
  );
}
