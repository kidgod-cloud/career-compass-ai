import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Career<span className="text-gradient">Shift</span>
            </span>
          </Link>

          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">기능</a>
            <a href="#strategy" className="hover:text-foreground transition-colors">경력 전략</a>
            <a href="#resume" className="hover:text-foreground transition-colors">이력서</a>
            <a href="#branding" className="hover:text-foreground transition-colors">브랜딩</a>
          </nav>

          <p className="text-sm text-muted-foreground">
            © 2024 CareerShift. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
