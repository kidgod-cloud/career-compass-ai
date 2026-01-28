import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, PenTool, Users, X, Download } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { exportStrategyToPDF } from "@/utils/pdfExport";

interface SelectedStrategy {
  type: "branding" | "content" | "networking";
  data: any;
}

interface StrategyCompareProps {
  selectedStrategies: SelectedStrategy[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

export function StrategyCompare({ selectedStrategies, onRemove, onClose }: StrategyCompareProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "branding":
        return <Award className="h-5 w-5 text-purple-500" />;
      case "content":
        return <PenTool className="h-5 w-5 text-blue-500" />;
      case "networking":
        return <Users className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "branding":
        return "퍼스널 브랜딩";
      case "content":
        return "콘텐츠 전략";
      case "networking":
        return "네트워킹 전략";
      default:
        return "";
    }
  };

  const getTitle = (item: SelectedStrategy) => {
    switch (item.type) {
      case "branding":
        return item.data.job_title;
      case "content":
        return item.data.target_audience;
      case "networking":
        return item.data.current_job;
      default:
        return "";
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">전략 비교 ({selectedStrategies.length}개 선택됨)</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            비교 닫기
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto">
          {selectedStrategies.map((item) => (
            <Card key={item.data.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => onRemove(item.data.id)}
              >
                <X className="h-3 w-3" />
              </Button>
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(item.type)}
                  <Badge variant="outline" className="text-xs">
                    {getTypeName(item.type)}
                  </Badge>
                </div>
                <p className="font-semibold text-sm mt-2">{getTitle(item)}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.data.created_at), "yyyy.MM.dd", { locale: ko })}
                </p>
              </CardHeader>
              <CardContent className="pt-0 max-h-[400px] overflow-y-auto">
                <CompareDetail type={item.type} strategy={item.data.strategy} />
              </CardContent>
              <div className="p-3 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => exportStrategyToPDF({ type: item.type, data: item.data })}
                >
                  <Download className="h-3 w-3 mr-1" />
                  PDF
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CompareDetail({ type, strategy }: { type: string; strategy: any }) {
  if (type === "branding") {
    return (
      <div className="space-y-3 text-xs">
        {strategy.brandStatement && (
          <div>
            <p className="font-medium text-muted-foreground mb-1">브랜드 스테이트먼트</p>
            <p className="font-semibold">{strategy.brandStatement.headline}</p>
            <p className="text-muted-foreground mt-1">{strategy.brandStatement.tagline}</p>
          </div>
        )}
        {strategy.uniqueValueProposition && (
          <div>
            <p className="font-medium text-muted-foreground mb-1">고유 가치 제안</p>
            <p>{strategy.uniqueValueProposition.main}</p>
          </div>
        )}
        {strategy.brandPersonality?.traits && (
          <div>
            <p className="font-medium text-muted-foreground mb-1">브랜드 성격</p>
            <div className="flex flex-wrap gap-1">
              {strategy.brandPersonality.traits.slice(0, 3).map((trait: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === "content") {
    return (
      <div className="space-y-3 text-xs">
        {strategy.contentStrategy && (
          <div>
            <p className="font-medium text-muted-foreground mb-1">포지셔닝</p>
            <p>{strategy.contentStrategy.positioning}</p>
          </div>
        )}
        {strategy.contentPillars && (
          <div>
            <p className="font-medium text-muted-foreground mb-1">콘텐츠 필러</p>
            <div className="space-y-1">
              {strategy.contentPillars.slice(0, 3).map((pillar: any, i: number) => (
                <div key={i} className="p-1.5 bg-muted rounded">
                  <p className="font-medium">{pillar.pillar} ({pillar.percentage}%)</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {strategy.hashtagStrategy?.primary && (
          <div>
            <p className="font-medium text-muted-foreground mb-1">해시태그</p>
            <div className="flex flex-wrap gap-1">
              {strategy.hashtagStrategy.primary.slice(0, 4).map((tag: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === "networking") {
    return (
      <div className="space-y-3 text-xs">
        {strategy.networkingProfile && (
          <div>
            <p className="font-medium text-muted-foreground mb-1">네트워킹 스타일</p>
            <p>{strategy.networkingProfile.networkingStyle}</p>
            <p className="mt-1">{strategy.networkingProfile.uniqueValue}</p>
          </div>
        )}
        {strategy.targetAudience && (
          <div>
            <p className="font-medium text-muted-foreground mb-1">타겟 오디언스</p>
            <div className="space-y-1">
              {strategy.targetAudience.slice(0, 2).map((target: any, i: number) => (
                <div key={i} className="p-1.5 bg-muted rounded">
                  <p className="font-medium">{target.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {strategy.thirtyDayPlan && (
          <div>
            <p className="font-medium text-muted-foreground mb-1">30일 플랜</p>
            <div className="space-y-1">
              {Object.entries(strategy.thirtyDayPlan).slice(0, 2).map(([week, data]: [string, any]) => (
                <div key={week} className="p-1.5 bg-muted rounded">
                  <p className="font-medium">{week.toUpperCase()}: {data.focus}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
