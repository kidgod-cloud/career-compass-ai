import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Brain, ChevronRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
  tasks?: { id: string; title: string; completed?: boolean }[];
}

interface ActiveRoadmap {
  id: string;
  title: string;
  target_job: string | null;
  job_title: string | null;
  duration_months: number | null;
  milestones: Milestone[];
  progress: number;
  completedMilestones: number;
  totalMilestones: number;
}

function parseMilestones(milestonesData: Json): Milestone[] {
  if (!milestonesData) return [];
  
  // Handle nested structure: { milestones: [...] } or direct array [...]
  if (typeof milestonesData === 'object' && !Array.isArray(milestonesData)) {
    const obj = milestonesData as { milestones?: Json };
    if (obj.milestones && Array.isArray(obj.milestones)) {
      return obj.milestones.map((m, index) => ({
        id: String(index),
        title: (m as { title?: string }).title || `마일스톤 ${index + 1}`,
        description: (m as { goals?: string[] }).goals?.join(', '),
        completed: (m as { completed?: boolean }).completed || false,
      }));
    }
  }
  
  if (Array.isArray(milestonesData)) {
    return milestonesData.map((m, index) => ({
      id: String(index),
      title: (m as { title?: string }).title || `마일스톤 ${index + 1}`,
      description: (m as { goals?: string[] }).goals?.join(', '),
      completed: (m as { completed?: boolean }).completed || false,
    }));
  }
  
  return [];
}

function calculateProgress(milestones: Milestone[]): { progress: number; completed: number; total: number } {
  if (!milestones || milestones.length === 0) {
    return { progress: 0, completed: 0, total: 0 };
  }

  let totalTasks = 0;
  let completedTasks = 0;

  milestones.forEach((milestone) => {
    if (milestone.tasks && milestone.tasks.length > 0) {
      totalTasks += milestone.tasks.length;
      completedTasks += milestone.tasks.filter((task) => task.completed).length;
    } else {
      // If no tasks, count the milestone itself
      totalTasks += 1;
      if (milestone.completed) {
        completedTasks += 1;
      }
    }
  });

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const completedMilestones = milestones.filter((m) => m.completed).length;

  return { progress, completed: completedMilestones, total: milestones.length };
}

export function RoadmapProgress() {
  const [activeRoadmaps, setActiveRoadmaps] = useState<ActiveRoadmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveRoadmaps();
  }, []);

  const fetchActiveRoadmaps = async () => {
    try {
      const { data, error } = await supabase
        .from("career_roadmaps")
        .select("*")
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(3);

      if (error) throw error;

      const roadmapsWithProgress: ActiveRoadmap[] = (data || []).map((roadmap) => {
        const milestones = parseMilestones(roadmap.milestones);
        const { progress, completed, total } = calculateProgress(milestones);

        return {
          id: roadmap.id,
          title: roadmap.title,
          target_job: roadmap.target_job,
          job_title: roadmap.job_title,
          duration_months: roadmap.duration_months,
          milestones,
          progress,
          completedMilestones: completed,
          totalMilestones: total,
        };
      });

      setActiveRoadmaps(roadmapsWithProgress);
    } catch (error) {
      console.error("Error fetching active roadmaps:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeRoadmaps.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            진행 중인 로드맵
          </CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/roadmap" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              전체 보기
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activeRoadmaps.map((roadmap) => (
            <div key={roadmap.id} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                    <h4 className="font-medium text-foreground truncate">{roadmap.title}</h4>
                  </div>
                  {(roadmap.job_title || roadmap.target_job) && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {roadmap.job_title}
                      {roadmap.job_title && roadmap.target_job && " → "}
                      {roadmap.target_job}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-bold text-primary">{roadmap.progress}%</span>
                  <p className="text-xs text-muted-foreground">
                    {roadmap.completedMilestones}/{roadmap.totalMilestones} 마일스톤
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Progress value={roadmap.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{roadmap.duration_months || 6}개월 계획</span>
                  <span>
                    {roadmap.progress === 100
                      ? "완료!"
                      : roadmap.progress >= 75
                        ? "거의 다 왔어요!"
                        : roadmap.progress >= 50
                          ? "절반 완료"
                          : roadmap.progress >= 25
                            ? "좋은 시작이에요"
                            : "시작해볼까요?"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
