import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Compass, Mic, Loader2, MessageSquare, CheckCircle, AlertCircle, Lightbulb, ChevronRight, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InterviewQuestion {
  id: number;
  category: string;
  question: string;
  tip: string;
}

interface AnswerFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  starAnalysis: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  improvedAnswer: string;
  tips: string[];
}

const industries = [
  "IT/소프트웨어",
  "금융/은행",
  "제조업",
  "의료/헬스케어",
  "교육",
  "마케팅/광고",
  "컨설팅",
  "미디어/엔터테인먼트",
  "유통/물류",
  "기타",
];

export default function InterviewCoach() {
  const [targetJob, setTargetJob] = useState("");
  const [industry, setIndustry] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [stage, setStage] = useState<"setup" | "interview" | "feedback">("setup");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const generateQuestions = async () => {
    if (!targetJob.trim()) {
      toast({
        variant: "destructive",
        title: "입력 필요",
        description: "목표 직무를 입력해주세요.",
      });
      return;
    }

    setLoadingQuestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('interview-coach', {
        body: {
          action: 'generate_questions',
          targetJob,
          industry,
          experienceYears: experienceYears ? parseInt(experienceYears) : 0,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setStage("interview");
      toast({
        title: "질문 생성 완료",
        description: `${data.questions.length}개의 면접 질문이 준비되었습니다.`,
      });
    } catch (error: any) {
      console.error("Error generating questions:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description: error.message || "질문 생성 중 오류가 발생했습니다.",
      });
    } finally {
      setLoadingQuestions(false);
    }
  };

  const evaluateAnswer = async () => {
    if (!answer.trim()) {
      toast({
        variant: "destructive",
        title: "입력 필요",
        description: "답변을 입력해주세요.",
      });
      return;
    }

    setLoadingFeedback(true);
    try {
      const { data, error } = await supabase.functions.invoke('interview-coach', {
        body: {
          action: 'evaluate_answer',
          targetJob,
          question: questions[currentQuestionIndex].question,
          answer,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setFeedback(data);
      setStage("feedback");
    } catch (error: any) {
      console.error("Error evaluating answer:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description: error.message || "답변 평가 중 오류가 발생했습니다.",
      });
    } finally {
      setLoadingFeedback(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer("");
      setFeedback(null);
      setStage("interview");
    }
  };

  const resetInterview = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswer("");
    setFeedback(null);
    setStage("setup");
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link to="/" className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Compass className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl text-foreground">
                  Career<span className="text-gradient">Shift</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10">
              <Mic className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">AI 면접 코치</h1>
          </div>
          <p className="text-muted-foreground">
            목표 직무에 맞는 모의 면접을 진행하고 AI 피드백을 받아보세요.
          </p>
        </div>

        {/* Setup Stage */}
        {stage === "setup" && (
          <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="targetJob">목표 직무 *</Label>
              <Input
                id="targetJob"
                placeholder="예: 프로덕트 매니저"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">업계</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="업계를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">경력 연수</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                placeholder="예: 3"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
              />
            </div>

            <Button 
              className="w-full" 
              size="lg" 
              onClick={generateQuestions}
              disabled={loadingQuestions}
            >
              {loadingQuestions ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  질문 생성 중...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  모의 면접 시작
                </>
              )}
            </Button>
          </div>
        )}

        {/* Interview Stage */}
        {stage === "interview" && currentQuestion && (
          <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>질문 {currentQuestionIndex + 1} / {questions.length}</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {currentQuestion.category}
              </span>
            </div>

            {/* Question Card */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {currentQuestion.question}
              </h2>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{currentQuestion.tip}</p>
              </div>
            </div>

            {/* Answer Input */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <Label htmlFor="answer">답변을 입력하세요</Label>
              <Textarea
                id="answer"
                placeholder="STAR 기법(상황-과제-행동-결과)을 활용하여 답변해보세요..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[200px]"
              />
              <Button 
                className="w-full" 
                size="lg" 
                onClick={evaluateAnswer}
                disabled={loadingFeedback}
              >
                {loadingFeedback ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    답변 평가 중...
                  </>
                ) : (
                  "답변 제출 및 피드백 받기"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Feedback Stage */}
        {stage === "feedback" && feedback && (
          <div className="space-y-6">
            {/* Score */}
            <div className="bg-card rounded-2xl border border-border p-6 text-center">
              <div className="text-6xl font-bold text-primary mb-2">{feedback.score}</div>
              <div className="text-muted-foreground">점수 (100점 만점)</div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-foreground">강점</h3>
                </div>
                <ul className="space-y-2">
                  {feedback.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-500">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-foreground">개선점</h3>
                </div>
                <ul className="space-y-2">
                  {feedback.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* STAR Analysis */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">STAR 분석</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: 'situation', label: 'Situation (상황)', value: feedback.starAnalysis.situation },
                  { key: 'task', label: 'Task (과제)', value: feedback.starAnalysis.task },
                  { key: 'action', label: 'Action (행동)', value: feedback.starAnalysis.action },
                  { key: 'result', label: 'Result (결과)', value: feedback.starAnalysis.result },
                ].map((item) => (
                  <div key={item.key} className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm font-medium text-primary mb-1">{item.label}</div>
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Improved Answer */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">개선된 답변 예시</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{feedback.improvedAnswer}</p>
            </div>

            {/* Tips */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">추가 팁</h3>
              </div>
              <ul className="space-y-2">
                {feedback.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {currentQuestionIndex < questions.length - 1 && (
                <Button className="flex-1" size="lg" onClick={nextQuestion}>
                  다음 질문
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              <Button variant="outline" size="lg" onClick={resetInterview} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                새로운 면접 시작
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
