import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Bug, ChevronDown, ChevronRight, Download, Settings } from "lucide-react";
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

const STACK_LINES_STORAGE_KEY = "errorCollector:stackLines";
const STACK_SETTINGS_STORAGE_KEY = "errorCollector:stackSettings";
const DEFAULT_INITIAL_LINES = 5;
const DEFAULT_LINES_STEP = 10;

const loadStackLines = (): Record<string, number> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STACK_LINES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
};

interface StackSettings {
  initialLines: number;
  linesStep: number;
}

const loadStackSettings = (): StackSettings => {
  const fallback = { initialLines: DEFAULT_INITIAL_LINES, linesStep: DEFAULT_LINES_STEP };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STACK_SETTINGS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<StackSettings>;
    return {
      initialLines: Math.max(1, Number(parsed.initialLines) || DEFAULT_INITIAL_LINES),
      linesStep: Math.max(1, Number(parsed.linesStep) || DEFAULT_LINES_STEP),
    };
  } catch {
    return fallback;
  }
};

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
  const [stackLines, setStackLines] = useState<Record<string, number>>(() => loadStackLines());
  const [stackSettings, setStackSettings] = useState<StackSettings>(() => loadStackSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [stackSearch, setStackSearch] = useState<Record<string, string>>({});
  const [activeMatchIndex, setActiveMatchIndex] = useState<Record<string, number>>({});
  const stackContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const STACK_INITIAL_LINES = stackSettings.initialLines;
  const STACK_LINES_STEP = stackSettings.linesStep;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STACK_LINES_STORAGE_KEY, JSON.stringify(stackLines));
    } catch {
      // ignore quota/serialization errors
    }
  }, [stackLines]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STACK_SETTINGS_STORAGE_KEY, JSON.stringify(stackSettings));
    } catch {
      // ignore
    }
  }, [stackSettings]);

  useEffect(() => {
    Object.entries(activeMatchIndex).forEach(([id, idx]) => {
      const container = stackContainerRefs.current[id];
      if (!container) return;
      const matches = container.querySelectorAll<HTMLElement>("[data-stack-match='true']");
      const el = matches[idx];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }, [activeMatchIndex]);

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
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-foreground">오류 필터</h4>
            <p className="text-xs text-muted-foreground">
              조건에 맞는 오류만 JSON으로 내려받습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen((p) => !p)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label="설정"
            title="스택 표시 설정"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
        <Separator />

        {settingsOpen && (
          <>
            <div className="space-y-2 rounded border border-border/50 bg-muted/30 p-2">
              <Label className="text-xs font-medium">스택 표시 설정</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="ec-initial" className="text-[10px] text-muted-foreground">
                    초기 줄 수
                  </Label>
                  <Input
                    id="ec-initial"
                    type="number"
                    min={1}
                    value={stackSettings.initialLines}
                    onChange={(e) =>
                      setStackSettings((p) => ({
                        ...p,
                        initialLines: Math.max(1, Number(e.target.value) || 1),
                      }))
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ec-step" className="text-[10px] text-muted-foreground">
                    더보기 단위
                  </Label>
                  <Input
                    id="ec-step"
                    type="number"
                    min={1}
                    value={stackSettings.linesStep}
                    onChange={(e) =>
                      setStackSettings((p) => ({
                        ...p,
                        linesStep: Math.max(1, Number(e.target.value) || 1),
                      }))
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setStackSettings({
                    initialLines: DEFAULT_INITIAL_LINES,
                    linesStep: DEFAULT_LINES_STEP,
                  })
                }
                className="text-[10px] text-muted-foreground hover:text-foreground hover:underline"
              >
                기본값으로 (초기 {DEFAULT_INITIAL_LINES}줄 / 단위 {DEFAULT_LINES_STEP}줄)
              </button>
            </div>
            <Separator />
          </>
        )}

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
                        {isOpen && (() => {
                          const allLines = e.stack.split("\n");
                          const shown = stackLines[e.id] ?? STACK_INITIAL_LINES;
                          const visible = allLines.slice(0, shown);
                          const remaining = allLines.length - visible.length;
                          const query = (stackSearch[e.id] ?? "").trim();
                          const q = query.toLowerCase();
                          const matchCount = q
                            ? visible.filter((l) => l.toLowerCase().includes(q)).length
                            : 0;
                          return (
                            <div className="space-y-1">
                              <Input
                                value={stackSearch[e.id] ?? ""}
                                onChange={(ev) => {
                                  setStackSearch((p) => ({ ...p, [e.id]: ev.target.value }));
                                  setActiveMatchIndex((p) => ({ ...p, [e.id]: 0 }));
                                }}
                                placeholder="스택에서 검색 (예: at, .tsx, TypeError)"
                                className="h-6 text-[10px] px-1.5"
                              />
                              <div
                                ref={(el) => {
                                  stackContainerRefs.current[e.id] = el;
                                  if (!el || !q) return;
                                  const first = el.querySelector<HTMLElement>("[data-stack-match='true']");
                                  if (first) {
                                    el.scrollTop = Math.max(0, first.offsetTop - 8);
                                  }
                                }}
                                className="font-mono text-[10px] text-muted-foreground whitespace-pre-wrap break-all rounded bg-background/60 border border-border/50 p-1.5 max-h-32 overflow-y-auto"
                              >
                                {(() => {
                                  let matchIdx = -1;
                                  return visible.map((line, i) => {
                                    const isMatch = q && line.toLowerCase().includes(q);
                                    if (isMatch) matchIdx++;
                                    const isActive = isMatch && matchIdx === (activeMatchIndex[e.id] ?? 0);
                                    if (!isMatch) {
                                      return (
                                        <div key={i} className="leading-tight">
                                          {line || "\u00a0"}
                                        </div>
                                      );
                                    }
                                    const parts: React.ReactNode[] = [];
                                    let rest = line;
                                    let key = 0;
                                    while (true) {
                                      const idx = rest.toLowerCase().indexOf(q);
                                      if (idx === -1) {
                                        parts.push(rest);
                                        break;
                                      }
                                      parts.push(rest.slice(0, idx));
                                      parts.push(
                                        <mark
                                          key={key++}
                                          className="bg-primary/30 text-foreground rounded px-0.5"
                                        >
                                          {rest.slice(idx, idx + q.length)}
                                        </mark>
                                      );
                                      rest = rest.slice(idx + q.length);
                                    }
                                    return (
                                      <div
                                        key={i}
                                        data-stack-match="true"
                                        data-active-match={isActive ? "true" : undefined}
                                        className={`leading-tight rounded ${isActive ? "bg-primary/25 ring-1 ring-primary/30" : "bg-primary/10"}`}
                                      >
                                        {parts}
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                              {q && (
                                <div className="text-[10px] text-muted-foreground">
                                  {matchCount > 0
                                    ? `${matchCount}줄 일치 (표시된 ${visible.length}줄 중)`
                                    : "표시된 줄에서 일치 없음 — 더보기로 확장해 보세요"}
                                </div>
                              )}
                              {remaining > 0 && (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setStackLines((p) => ({
                                        ...p,
                                        [e.id]: shown + STACK_LINES_STEP,
                                      }))
                                    }
                                    className="text-[10px] text-primary hover:underline"
                                  >
                                    더보기 (+{Math.min(STACK_LINES_STEP, remaining)})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setStackLines((p) => ({ ...p, [e.id]: allLines.length }))
                                    }
                                    className="text-[10px] text-muted-foreground hover:text-foreground hover:underline"
                                  >
                                    전체 보기 ({allLines.length}줄)
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}
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
