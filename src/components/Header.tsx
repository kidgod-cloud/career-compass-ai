import { Button } from "@/components/ui/button";
import { Compass, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Career<span className="text-gradient">Shift</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              기능
            </a>
            <a href="#strategy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              경력 전략
            </a>
            <a href="#resume" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              이력서 & 면접
            </a>
            <a href="#branding" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              개인 브랜딩
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="sm">
                무료로 시작하기
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col gap-3">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                기능
              </a>
              <a href="#strategy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                경력 전략
              </a>
              <a href="#resume" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                이력서 & 면접
              </a>
              <a href="#branding" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                개인 브랜딩
              </a>
            </nav>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Link to="/auth">
                <Button variant="ghost" className="w-full justify-center">
                  로그인
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="hero" className="w-full justify-center">
                  무료로 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
