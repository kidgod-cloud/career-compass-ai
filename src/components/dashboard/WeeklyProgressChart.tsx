import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { startOfWeek, addDays, format, isWithinInterval } from "date-fns";
import { ko } from "date-fns/locale";

interface MilestoneData {
  title?: string;
  completed?: boolean;
  goals?: string[];
  completedGoals?: number[];
}

interface WeekDay {
  day: string;
  completed: number;
  total: number;
}

const chartConfig = {
  completed: {
    label: "완료",
    color: "hsl(var(--primary))",
  },
  remaining: {
    label: "남은 할 일",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig;

export function WeeklyProgressChart() {
  const [data, setData] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: roadmaps, error } = await supabase
        .from("career_roadmaps")
        .select("milestones, duration_months, created_at")
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Count total goals and completed goals from active milestones
      let allGoals = 0;
      let completedGoals = 0;

      (roadmaps || []).forEach((roadmap) => {
        const milestones = parseMilestones(roadmap.milestones);
        milestones.forEach((m) => {
          const goals = m.goals?.length || 0;
          const completed = m.completedGoals?.length || 0;
          allGoals += goals;
          completedGoals += completed;
        });
      });

      setTotalCompleted(completedGoals);
      setTotalTasks(allGoals);

      // Build weekly view - distribute tasks across this week
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const days: WeekDay[] = [];
      const todayIndex = Math.min(
        Math.floor((new Date().getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)),
        6
      );

      const tasksPerDay = allGoals > 0 ? Math.ceil(allGoals / 7) : 0;
      const completedPerDay = allGoals > 0 ? Math.ceil(completedGoals / Math.max(todayIndex + 1, 1)) : 0;

      for (let i = 0; i < 7; i++) {
        const dayDate = addDays(weekStart, i);
        const dayLabel = format(dayDate, "EEE", { locale: ko });
        const isToday = i === todayIndex;
        const isPast = i < todayIndex;

        days.push({
          day: isToday ? `${dayLabel}(오늘)` : dayLabel,
          completed: isPast ? completedPerDay : isToday ? completedPerDay : 0,
          total: tasksPerDay,
        });
      }

      setData(days);
    } catch (error) {
      console.error("Error fetching weekly progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalTasks === 0) return null;

  return (
    <Card className="mb-8 animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            주간 진행률
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">{progressPercent}%</span>
            <span className="text-sm text-muted-foreground">
              ({totalCompleted}/{totalTasks})
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="completed"
              fill="var(--color-completed)"
              radius={[4, 4, 0, 0]}
              stackId="a"
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="total"
              fill="var(--color-remaining)"
              radius={[4, 4, 0, 0]}
              stackId="b"
              opacity={0.3}
              animationDuration={1000}
              animationEasing="ease-out"
              animationBegin={300}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function parseMilestones(milestones: Json | null): MilestoneData[] {
  if (!milestones) return [];
  if (typeof milestones === "object" && !Array.isArray(milestones)) {
    const obj = milestones as { milestones?: Json };
    if (obj.milestones && Array.isArray(obj.milestones)) {
      return obj.milestones as MilestoneData[];
    }
  }
  if (Array.isArray(milestones)) {
    return milestones as MilestoneData[];
  }
  return [];
}
