import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
  color?: "cyan" | "teal" | "emerald" | "amber" | "violet";
}

const colorClasses = {
  cyan: "from-cyan/20 to-cyan/5 hover:from-cyan/30 hover:to-cyan/10 border-cyan/20",
  teal: "from-teal/20 to-teal/5 hover:from-teal/30 hover:to-teal/10 border-teal/20",
  emerald: "from-emerald/20 to-emerald/5 hover:from-emerald/30 hover:to-emerald/10 border-emerald/20",
  amber: "from-amber/20 to-amber/5 hover:from-amber/30 hover:to-amber/10 border-amber/20",
  violet: "from-violet/20 to-violet/5 hover:from-violet/30 hover:to-violet/10 border-violet/20",
};

const iconColorClasses = {
  cyan: "text-cyan bg-cyan/10",
  teal: "text-teal bg-teal/10",
  emerald: "text-emerald bg-emerald/10",
  amber: "text-amber bg-amber/10",
  violet: "text-violet bg-violet/10",
};

export function FeatureCard({ icon: Icon, title, description, index, color = "cyan" }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative p-6 rounded-2xl border bg-gradient-to-br transition-all duration-500",
        "hover:shadow-card hover:-translate-y-1 cursor-pointer",
        colorClasses[color]
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-xl transition-transform duration-300 group-hover:scale-110", iconColorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-2 group-hover:text-gradient transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
    </div>
  );
}
