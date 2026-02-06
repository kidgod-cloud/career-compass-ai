import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronRight, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface Task {
  id: string;
  roadmapId: string;
  roadmapTitle: string;
  milestoneIndex: number;
  goalIndex: number;
  text: string;
  completed: boolean;
}

interface MilestoneData {
  title?: string;
  completed?: boolean;
  goals?: string[];
  completedGoals?: number[];
}

function extractTasksFromRoadmaps(
  roadmaps: { id: string; title: string; milestones: Json }[]
): Task[] {
  const tasks: Task[] = [];

  roadmaps.forEach((roadmap) => {
    let milestones: MilestoneData[] = [];

    // Parse milestones from different structures
    if (roadmap.milestones) {
      if (typeof roadmap.milestones === "object" && !Array.isArray(roadmap.milestones)) {
        const obj = roadmap.milestones as { milestones?: Json };
        if (obj.milestones && Array.isArray(obj.milestones)) {
          milestones = obj.milestones as MilestoneData[];
        }
      } else if (Array.isArray(roadmap.milestones)) {
        milestones = roadmap.milestones as MilestoneData[];
      }
    }

    // Only get tasks from the first incomplete milestone (current focus)
    const currentMilestoneIndex = milestones.findIndex((m) => !m.completed);
    if (currentMilestoneIndex === -1) return;

    const currentMilestone = milestones[currentMilestoneIndex];
    const goals = currentMilestone.goals || [];
    const completedGoals = currentMilestone.completedGoals || [];

    goals.forEach((goal, goalIndex) => {
      tasks.push({
        id: `${roadmap.id}-${currentMilestoneIndex}-${goalIndex}`,
        roadmapId: roadmap.id,
        roadmapTitle: roadmap.title,
        milestoneIndex: currentMilestoneIndex,
        goalIndex,
        text: goal,
        completed: completedGoals.includes(goalIndex),
      });
    });
  });

  return tasks;
}

export function WeeklyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("career_roadmaps")
        .select("id, title, milestones")
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
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        )
      );
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
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                task.completed
                  ? "bg-muted/30 border-muted"
                  : "bg-background border-border hover:border-primary/30"
              }`}
            >
              <Checkbox
                id={task.id}
                checked={task.completed}
                disabled={updating === task.id}
                onCheckedChange={() => handleToggleTask(task)}
                className="mt-0.5"
              />
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
                <div className="flex items-center gap-1 mt-1">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">
                    {task.roadmapTitle}
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
