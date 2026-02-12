import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronRight, Clock, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { TaskCelebration } from "./TaskCelebration";
import { addMonths, differenceInDays, format, isPast } from "date-fns";
import { ko } from "date-fns/locale";

interface Task {
  id: string;
  roadmapId: string;
  roadmapTitle: string;
  milestoneIndex: number;
  goalIndex: number;
  text: string;
  completed: boolean;
  deadline: Date | null;
}

interface MilestoneData {
  title?: string;
  completed?: boolean;
  goals?: string[];
  completedGoals?: number[];
}

interface RoadmapRow {
  id: string;
  title: string;
  milestones: Json;
  duration_months: number | null;
  created_at: string;
}

function parseMilestones(milestones: Json): MilestoneData[] {
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

function calculateDeadline(
  createdAt: string,
  durationMonths: number,
  milestoneIndex: number,
  totalMilestones: number
): Date {
  const start = new Date(createdAt);
  const monthsPerMilestone = durationMonths / totalMilestones;
  return addMonths(start, monthsPerMilestone * (milestoneIndex + 1));
}

function extractTasksFromRoadmaps(roadmaps: RoadmapRow[]): Task[] {
  const tasks: Task[] = [];

  roadmaps.forEach((roadmap) => {
    const milestones = parseMilestones(roadmap.milestones);
    const currentMilestoneIndex = milestones.findIndex((m) => !m.completed);
    if (currentMilestoneIndex === -1) return;

    const currentMilestone = milestones[currentMilestoneIndex];
    const goals = currentMilestone.goals || [];
    const completedGoals = currentMilestone.completedGoals || [];
    const duration = roadmap.duration_months || 6;

    const deadline =
      milestones.length > 0
        ? calculateDeadline(
            roadmap.created_at,
            duration,
            currentMilestoneIndex,
            milestones.length
          )
        : null;

    goals.forEach((goal, goalIndex) => {
      tasks.push({
        id: `${roadmap.id}-${currentMilestoneIndex}-${goalIndex}`,
        roadmapId: roadmap.id,
        roadmapTitle: roadmap.title,
        milestoneIndex: currentMilestoneIndex,
        goalIndex,
        text: goal,
        completed: completedGoals.includes(goalIndex),
        deadline,
      });
    });
  });

  return tasks;
}

function DeadlineBadge({ deadline }: { deadline: Date | null }) {
  if (!deadline) return null;

  const now = new Date();
  const daysLeft = differenceInDays(deadline, now);
  const overdue = isPast(deadline);

  if (!overdue && daysLeft > 7) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{format(deadline, "M/d", { locale: ko })}</span>
        <span className="opacity-70">({daysLeft}일 남음)</span>
      </span>
    );
  }

  const isUrgent = overdue || daysLeft <= 3;

  const label = overdue
    ? "마감 초과"
    : daysLeft === 0
      ? "오늘 마감"
      : `${daysLeft}일 남음`;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        isUrgent
          ? "bg-destructive/10 text-destructive animate-pulse"
          : "bg-amber-500/10 text-amber-600"
      }`}
    >
      <Clock className="h-3 w-3" />
      <span>{format(deadline, "M/d", { locale: ko })}</span>
      <span>({label})</span>
    </span>
  );
}

export function WeeklyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

  const handleCelebrationComplete = useCallback(() => {
    setCelebratingId(null);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("career_roadmaps")
        .select("id, title, milestones, duration_months, created_at")
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(3);

      if (error) throw error;

      const extractedTasks = extractTasksFromRoadmaps(data || []);
      setTasks(extractedTasks.slice(0, 5)); // Show top 5 tasks
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    setUpdating(task.id);

    try {
      // Fetch the current roadmap
      const { data: roadmap, error: fetchError } = await supabase
        .from("career_roadmaps")
        .select("milestones")
        .eq("id", task.roadmapId)
        .single();

      if (fetchError) throw fetchError;

      // Parse milestones
      let milestones: MilestoneData[] = [];
      let isNested = false;

      if (roadmap.milestones) {
        if (typeof roadmap.milestones === "object" && !Array.isArray(roadmap.milestones)) {
          const obj = roadmap.milestones as { milestones?: Json };
          if (obj.milestones && Array.isArray(obj.milestones)) {
            milestones = [...(obj.milestones as MilestoneData[])];
            isNested = true;
          }
        } else if (Array.isArray(roadmap.milestones)) {
          milestones = [...(roadmap.milestones as MilestoneData[])];
        }
      }

      // Update the completedGoals array
      const milestone = milestones[task.milestoneIndex];
      const completedGoals = [...(milestone.completedGoals || [])];

      if (task.completed) {
        // Remove from completed
        const index = completedGoals.indexOf(task.goalIndex);
        if (index > -1) completedGoals.splice(index, 1);
      } else {
        // Add to completed
        if (!completedGoals.includes(task.goalIndex)) {
          completedGoals.push(task.goalIndex);
        }
      }

      milestones[task.milestoneIndex] = {
        ...milestone,
        completedGoals,
      };

      // Check if all goals are completed to mark milestone as complete
      const allGoalsCompleted =
        milestone.goals && completedGoals.length === milestone.goals.length;
      if (allGoalsCompleted) {
        milestones[task.milestoneIndex].completed = true;
      }

      // Update the database
      const updatedMilestones = isNested ? { milestones } : milestones;

      const { error: updateError } = await supabase
        .from("career_roadmaps")
        .update({ milestones: updatedMilestones as unknown as Json })
        .eq("id", task.roadmapId);

      if (updateError) throw updateError;

      // Update local state
      const nowCompleted = !task.completed;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: nowCompleted } : t
        )
      );

      // Trigger celebration animation on complete
      if (nowCompleted) {
        setCelebratingId(task.id);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return null;
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const sortedTasks = [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed));

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            이번 주 할 일
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {completedCount}/{tasks.length} 완료
            </span>
            <Button asChild variant="ghost" size="sm">
              <Link
                to="/roadmap"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                전체 보기
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedTasks.map((task) => (
              <div
              key={task.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-500 ease-in-out ${
                task.completed
                  ? "bg-muted/30 border-muted opacity-60 translate-x-1"
                  : "bg-background border-border hover:border-primary/30 opacity-100 translate-x-0"
              }`}
            >
              <div className="relative">
                <Checkbox
                  id={task.id}
                  checked={task.completed}
                  disabled={updating === task.id}
                  onCheckedChange={() => handleToggleTask(task)}
                  className="mt-0.5"
                  style={
                    celebratingId === task.id
                      ? { animation: "check-pop 0.3s ease-out" }
                      : undefined
                  }
                />
                <TaskCelebration
                  show={celebratingId === task.id}
                  onComplete={handleCelebrationComplete}
                />
              </div>
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={task.id}
                  className={`text-sm cursor-pointer ${
                    task.completed
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {task.text}
                </label>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">
                      {task.roadmapTitle}
                    </span>
                  </span>
                  {!task.completed && <DeadlineBadge deadline={task.deadline} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
