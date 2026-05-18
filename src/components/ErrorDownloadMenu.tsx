import { useMemo, useState } from "react";
import { Bug, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  downloadAppErrors,
  filterAppErrors,
  type CollectedError,
  type DownloadFilters,
} from "@/utils/errorCollector";

const PREVIEW_LIMIT = 5;

const SOURCES: CollectedError["source"][] = [
  "console.error",
  "console.warn",
  "window.error",
  "unhandledrejection",
];

interface Props {
  count: number;
}

export function ErrorDownloadMenu({ count }: Props) {
  const [open, setOpen] = useState(false);
  const [sources, setSources] = useState<CollectedError["source"][]>([]);
  const [keywords, setKeywords] = useState("");
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");

  const toggleSource = (s: CollectedError["source"]) => {
    setSources((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleDownload = () => {
    const filters: DownloadFilters = {};
    if (sources.length > 0) filters.sources = sources;
    const kws = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    if (kws.length > 0) filters.keywords = kws;
    if (since) filters.since = new Date(since).toISOString();
    if (until) filters.until = new Date(until).toISOString();
    downloadAppErrors(filters);
    setOpen(false);
  };

  const handleReset = () => {
    setSources([]);
    setKeywords("");
    setSince("");
    setUntil("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <Bug className="w-4 h-4" />
          <span className="text-xs font-semibold">{count}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">오류 필터</h4>
          <p className="text-xs text-muted-foreground">
            조건에 맞는 오류만 JSON으로 내려받습니다.
          </p>
        </div>
        <Separator />

        <div className="space-y-2">
          <Label className="text-xs font-medium">오류 타입 (선택 안 하면 전체)</Label>
          <div className="grid grid-cols-2 gap-2">
            {SOURCES.map((s) => (
              <label
                key={s}
                className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer"
              >
                <Checkbox
                  checked={sources.includes(s)}
                  onCheckedChange={() => toggleSource(s)}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ec-keywords" className="text-xs font-medium">
            키워드 (콤마로 구분, OR)
          </Label>
          <Input
            id="ec-keywords"
            placeholder="예: fetch, 401, supabase"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="ec-since" className="text-xs font-medium">시작</Label>
            <Input
              id="ec-since"
              type="datetime-local"
              value={since}
              onChange={(e) => setSince(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ec-until" className="text-xs font-medium">종료</Label>
            <Input
              id="ec-until"
              type="datetime-local"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        <Separator />
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
            초기화
          </Button>
          <Button size="sm" onClick={handleDownload} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            다운로드
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
