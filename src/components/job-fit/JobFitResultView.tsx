import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, XCircle, Lightbulb, Mic, TrendingUp, Download, Save, Loader2 } from "lucide-react";
import { exportJobFitToPDF } from "@/utils/jobFitPdfExport";

interface Dimension {
  name: string;
  score: number;
  grade: string;
  comment: string;
}

interface EvalResult {
  grade: string;
  score: number;
  summary: string;
  dimensions: Dimension[];
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  interviewTips: string[];
}

const gradeColors: Record<string, string> = {
  A: "bg-emerald-500 text-white",
  B: "bg-blue-500 text-white",
  C: "bg-yellow-500 text-white",
  D: "bg-orange-500 text-white",
  E: "bg-red-400 text-white",
  F: "bg-red-600 text-white",
};

const gradeBarColors: Record<string, string> = {
  A: "bg-emerald-500",
  B: "bg-blue-500",
  C: "bg-yellow-500",
  D: "bg-orange-500",
  E: "bg-red-400",
  F: "bg-red-600",
};

interface Props {
  result: EvalResult;
  onSave?: () => void;
  saving?: boolean;
}

export default function JobFitResultView({ result, onSave, saving }: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Grade Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black ${gradeColors[result.grade] || gradeColors.C}`}>
              {result.grade}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-2xl font-bold text-foreground">{result.score}점</span>
                <Badge variant="outline">{result.grade === "A" || result.grade === "B" ? "추천" : result.grade === "C" ? "보통" : "보완 필요"}</Badge>
                <div className="flex items-center gap-2 ml-auto">
                  {onSave && (
                    <Button variant="outline" size="sm" onClick={onSave} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                      저장
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => exportJobFitToPDF(result)}>
                    <Download className="w-4 h-4 mr-1" />PDF
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground">{result.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimensions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            항목별 평가 (10개 차원)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.dimensions.map((dim, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{dim.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{dim.score}점</span>
                  <Badge className={`text-xs px-1.5 py-0 ${gradeColors[dim.grade] || ""}`}>{dim.grade}</Badge>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-1">
                <div
                  className={`h-2 rounded-full transition-all ${gradeBarColors[dim.grade] || "bg-primary"}`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{dim.comment}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strengths & Gaps */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              강점
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              보완점
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.gaps.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <XCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  {g}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            추천 액션
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                {r}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Interview Tips */}
      {result.interviewTips && result.interviewTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              면접 준비 팁
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.interviewTips.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-accent/20 text-accent-foreground text-xs flex items-center justify-center font-bold">💡</span>
                  {t}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
