import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, BookOpen, Calendar, Target, Lightbulb, Clock, CheckCircle2, Play, FileText, Code, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LearningPathAnalysis {
  overview: {
    targetJob: string;
    totalDays: number;
    estimatedHoursTotal: number;
    difficultyLevel: string;
    summary: string;
  };
  skillsToAcquire: Array<{
    skill: string;
    priority: string;
    estimatedHours: number;
    reason: string;
  }>;
  weeklyPlan: Array<{
    week: number;
    theme: string;
    goals: string[];
    days: Array<{
      day: number;
      title: string;
      tasks: Array<{
        task: string;
        duration: string;
        type: string;
        resource: string;
        description: string;
      }>;
      milestone: string;
    }>;
  }>;
  resources: {
    courses: Array<{
      name: string;
      platform: string;
      url: string;
      cost: string;
      duration: string;
    }>;
    books: Array<{
      title: string;
      author: string;
      reason: string;
    }>;
    tools: Array<{
      name: string;
      purpose: string;
      learnPriority: string;
    }>;
    communities: Array<{
      name: string;
      platform: string;
      benefit: string;
    }>;
  };
  milestones: Array<{
    week: number;
    title: string;
    description: string;
    deliverable: string;
  }>;
  tips: Array<{
    category: string;
    tip: string;
  }>;
  nextSteps: string[];
}

const LearningPath = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<LearningPathAnalysis | null>(null);
  
  const [formData, setFormData] = useState({
    targetJob: "",
    industry: "",
    currentSkills: "",
    experienceLevel: "",
    learningStyle: "",
    hoursPerDay: "2",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.targetJob) {
      toast({
        title: "입력 오류",
        description: "목표 직무를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-learning-path', {
        body: formData,
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "학습 경로 생성 완료",
        description: "30일 맞춤형 학습 계획이 생성되었습니다.",
      });
    } catch (error: any) {
      console.error('Error generating learning path:', error);
      toast({
        title: "오류 발생",
        description: error.message || "학습 경로 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'reading': return <FileText className="h-4 w-4" />;
      case 'practice': return <Code className="h-4 w-4" />;
      case 'project': return <Target className="h-4 w-4" />;
      case 'quiz': return <HelpCircle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'essential': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'recommended': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'optional': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          대시보드로 돌아가기
        </Button>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">30일 학습 경로 생성</h1>
            <p className="text-muted-foreground">
              목표 직무에 맞는 맞춤형 30일 학습 계획을 AI가 생성합니다
            </p>
          </div>

          {!analysis ? (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  학습 정보 입력
                </CardTitle>
                <CardDescription>
                  학습 목표와 현재 상태를 입력해주세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="targetJob">목표 직무 *</Label>
                      <Input
                        id="targetJob"
                        placeholder="예: 프론트엔드 개발자"
                        value={formData.targetJob}
                        onChange={(e) => setFormData({ ...formData, targetJob: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">산업 분야</Label>
                      <Input
                        id="industry"
                        placeholder="예: IT/소프트웨어"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentSkills">현재 보유 스킬</Label>
                    <Textarea
                      id="currentSkills"
                      placeholder="현재 보유하고 있는 기술과 경험을 입력해주세요..."
                      value={formData.currentSkills}
                      onChange={(e) => setFormData({ ...formData, currentSkills: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>경험 수준</Label>
                      <Select
                        value={formData.experienceLevel}
                        onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">입문자</SelectItem>
                          <SelectItem value="intermediate">중급자</SelectItem>
                          <SelectItem value="advanced">고급자</SelectItem>
                          <SelectItem value="career-change">직무 전환</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>선호 학습 방식</Label>
                      <Select
                        value={formData.learningStyle}
                        onValueChange={(value) => setFormData({ ...formData, learningStyle: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">영상 강의</SelectItem>
                          <SelectItem value="reading">문서/책</SelectItem>
                          <SelectItem value="practice">실습 위주</SelectItem>
                          <SelectItem value="mixed">복합</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>하루 학습 가능 시간</Label>
                      <Select
                        value={formData.hoursPerDay}
                        onValueChange={(value) => setFormData({ ...formData, hoursPerDay: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1시간</SelectItem>
                          <SelectItem value="2">2시간</SelectItem>
                          <SelectItem value="3">3시간</SelectItem>
                          <SelectItem value="4">4시간 이상</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        학습 경로 생성 중...
                      </>
                    ) : (
                      <>
                        <BookOpen className="mr-2 h-4 w-4" />
                        30일 학습 경로 생성
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">{analysis.overview.targetJob}</h2>
                      <p className="text-muted-foreground mt-1">{analysis.overview.summary}</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{analysis.overview.totalDays}</div>
                        <div className="text-xs text-muted-foreground">일</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{analysis.overview.estimatedHoursTotal}</div>
                        <div className="text-xs text-muted-foreground">시간</div>
                      </div>
                      <div className="text-center">
                        <Badge variant="outline" className={getPriorityColor(analysis.overview.difficultyLevel)}>
                          {analysis.overview.difficultyLevel === 'beginner' ? '입문' :
                           analysis.overview.difficultyLevel === 'intermediate' ? '중급' : '고급'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="weekly" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="weekly">주간 계획</TabsTrigger>
                  <TabsTrigger value="skills">습득 스킬</TabsTrigger>
                  <TabsTrigger value="resources">학습 자료</TabsTrigger>
                  <TabsTrigger value="tips">학습 팁</TabsTrigger>
                </TabsList>

                <TabsContent value="weekly" className="space-y-4 mt-4">
                  {analysis.weeklyPlan.map((week) => (
                    <Card key={week.week}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-primary" />
                              Week {week.week}: {week.theme}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              <div className="flex flex-wrap gap-2">
                                {week.goals.map((goal, idx) => (
                                  <Badge key={idx} variant="secondary">{goal}</Badge>
                                ))}
                              </div>
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              Day {week.days[0]?.day} - {week.days[week.days.length - 1]?.day}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          {week.days.map((day) => (
                            <AccordionItem key={day.day} value={`day-${day.day}`}>
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                    {day.day}
                                  </div>
                                  <div className="text-left">
                                    <div className="font-medium">{day.title}</div>
                                    <div className="text-xs text-muted-foreground">{day.milestone}</div>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-3 pl-11">
                                  {day.tasks.map((task, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                      <div className="mt-0.5 text-primary">
                                        {getTaskIcon(task.type)}
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-medium">{task.task}</div>
                                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                          <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {task.duration}
                                          </span>
                                          <Badge variant="outline" className="text-xs">{task.type}</Badge>
                                          <span>{task.resource}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}

                  {analysis.milestones && analysis.milestones.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          주요 마일스톤
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analysis.milestones.map((milestone, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                W{milestone.week}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{milestone.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">{milestone.deliverable}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="skills" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>습득할 스킬</CardTitle>
                      <CardDescription>30일 동안 배우게 될 핵심 기술들</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysis.skillsToAcquire.map((skill, idx) => (
                          <div key={idx} className="p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{skill.skill}</h4>
                                <Badge variant="outline" className={getPriorityColor(skill.priority)}>
                                  {skill.priority === 'high' ? '높음' : skill.priority === 'medium' ? '중간' : '낮음'}
                                </Badge>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {skill.estimatedHours}시간
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{skill.reason}</p>
                            <Progress value={(skill.estimatedHours / analysis.overview.estimatedHoursTotal) * 100} className="mt-2 h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resources" className="space-y-4 mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">추천 강의</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysis.resources.courses.map((course, idx) => (
                            <div key={idx} className="p-3 rounded-lg border">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{course.name}</h4>
                                <Badge variant={course.cost === 'free' ? 'secondary' : 'outline'}>
                                  {course.cost === 'free' ? '무료' : '유료'}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {course.platform} · {course.duration}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">추천 도서</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysis.resources.books.map((book, idx) => (
                            <div key={idx} className="p-3 rounded-lg border">
                              <h4 className="font-medium">{book.title}</h4>
                              <div className="text-sm text-muted-foreground">{book.author}</div>
                              <p className="text-sm mt-1">{book.reason}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">필수 도구</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysis.resources.tools.map((tool, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                              <div>
                                <h4 className="font-medium">{tool.name}</h4>
                                <div className="text-sm text-muted-foreground">{tool.purpose}</div>
                              </div>
                              <Badge variant="outline" className={getPriorityColor(tool.learnPriority)}>
                                {tool.learnPriority === 'essential' ? '필수' : 
                                 tool.learnPriority === 'recommended' ? '권장' : '선택'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">커뮤니티</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysis.resources.communities.map((community, idx) => (
                            <div key={idx} className="p-3 rounded-lg border">
                              <h4 className="font-medium">{community.name}</h4>
                              <div className="text-sm text-muted-foreground">{community.platform}</div>
                              <p className="text-sm mt-1">{community.benefit}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="tips" className="space-y-4 mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {['productivity', 'motivation', 'learning', 'networking'].map((category) => {
                      const categoryTips = analysis.tips.filter(t => t.category === category);
                      if (categoryTips.length === 0) return null;
                      
                      return (
                        <Card key={category}>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-primary" />
                              {category === 'productivity' ? '생산성' :
                               category === 'motivation' ? '동기부여' :
                               category === 'learning' ? '학습법' : '네트워킹'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {categoryTips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span className="text-sm">{tip.tip}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {analysis.nextSteps && analysis.nextSteps.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          30일 이후 다음 단계
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.nextSteps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setAnalysis(null)}>
                  새로운 학습 경로 생성
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
