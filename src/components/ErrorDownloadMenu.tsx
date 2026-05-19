import { useMemo, useState } from "react";
import { Bug, ChevronDown, ChevronRight, Download } from "lucide-react";
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleSource = (s: CollectedError["source"]) => {
    setSources((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const filters = useMemo<DownloadFilters>(() => {
    const f: DownloadFilters = {};
    if (sources.length > 0) f.sources = sources;
    const kws = keywords.split(",").map((k) => k.trim()).filter(Boolean);
    if (kws.length > 0) f.keywords = kws;
    if (since) f.since = new Date(since).toISOString();
    if (until) f.until = new Date(until).toISOString();
    return f;
  }, [sources, keywords, since, until]);

  const { matched, total, preview } = useMemo(() => {
    if (!open) return { matched: 0, total: 0, preview: [] as CollectedError[] };
    const all = (typeof window !== "undefined" && window.__appErrors) || [];
    const m = filterAppErrors(all, filters);
    return {
      matched: m.length,
      total: all.length,
      preview: m.slice(-PREVIEW_LIMIT).reverse(),
    };
  }, [open, filters]);

  const handleDownload = () => {
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">미리보기</Label>
            <span className="text-xs text-muted-foreground">
              {matched} / {total} 건 일치
            </span>
          </div>
          {preview.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              조건에 맞는 오류가 없습니다.
            </p>
          ) : (
            <ul className="space-y-1.5 max-h-40 overflow-y-auto rounded border border-border/50 bg-muted/30 p-2">
              {preview.map((e) => (
                <li key={e.id} className="text-xs space-y-0.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="font-mono text-[10px] px-1 rounded bg-background/60 border border-border/50">
                      {e.source}
                    </span>
                    <span className="text-[10px]">
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-foreground line-clamp-2 break-all">
                    {e.message}
                  </div>
                  {e.stack && (() => {
                    const lines = e.stack.split("\n").map((l) => l.trim()).filter(Boolean);
                    const head = lines.find((l) => l.startsWith("at ")) ?? lines[0];
                    const isOpen = !!expanded[e.id];
                    return (
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => setExpanded((p) => ({ ...p, [e.id]: !isOpen }))}
                          className="flex items-start gap-1 font-mono text-[10px] text-muted-foreground hover:text-foreground text-left w-full"
                        >
                          {isOpen ? (
                            <ChevronDown className="w-3 h-3 mt-0.5 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                          )}
                          <span className={isOpen ? "break-all" : "line-clamp-1 break-all"}>
                            {head}
                          </span>
                        </button>
                        {isOpen && (
                          <pre className="font-mono text-[10px] text-muted-foreground whitespace-pre-wrap break-all rounded bg-background/60 border border-border/50 p-1.5 max-h-32 overflow-y-auto">
                            {e.stack}
                          </pre>
                        )}
                      </div>
                    );
                  })()}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Separator />
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
            초기화
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={matched === 0}
            className="gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            다운로드 ({matched})
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
