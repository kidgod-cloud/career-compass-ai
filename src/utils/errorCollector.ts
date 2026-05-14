/**
 * 에러 수집기 (Error Collector)
 * --------------------------------
 * - console.error / console.warn 중 "Failed" 또는 "Error" 키워드를 포함하는 로그만 수집
 * - window.onerror, unhandledrejection 캡처
 * - 발생 시점의 화면(URL/경로) + 마지막 사용자 행동(클릭/입력/포커스 대상) 단서를 함께 기록
 *
 * 활성화:
 *   - 기본: 개발 환경에서만 활성화
 *   - VITE_ERROR_COLLECT = "on" | "off" 로 강제 토글 가능
 *
 * 콘솔 그룹 형태로 출력하며, window.__appErrors 에 최근 100건을 저장합니다.
 * 디버깅 시 `window.__appErrors` 또는 `window.__dumpAppErrors()` 호출.
 */

export interface CollectedError {
  id: string;
  timestamp: string;
  source: "console.error" | "console.warn" | "window.error" | "unhandledrejection";
  message: string;
  stack?: string;
  context: {
    url: string;
    pathname: string;
    viewport: string;
    userAgent: string;
    lastAction?: {
      type: string;
      target: string;
      text?: string;
      at: string;
    };
  };
}

const MAX_BUFFER = 100;
const KEYWORDS = /failed|error/i;

declare global {
  interface Window {
    __appErrors?: CollectedError[];
    __dumpAppErrors?: () => CollectedError[];
    __clearAppErrors?: () => void;
    __downloadAppErrors?: () => void;
  }
}

let initialized = false;

const formatTarget = (el: EventTarget | null): string => {
  if (!(el instanceof Element)) return "unknown";
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls = el.classList.length ? `.${Array.from(el.classList).slice(0, 2).join(".")}` : "";
  const role = el.getAttribute("role");
  const aria = el.getAttribute("aria-label");
  return `${tag}${id}${cls}${role ? `[role=${role}]` : ""}${aria ? `[aria-label=${aria}]` : ""}`;
};

const safeText = (el: EventTarget | null): string | undefined => {
  if (!(el instanceof HTMLElement)) return undefined;
  const t = el.innerText?.trim().slice(0, 60);
  return t || undefined;
};

let lastAction: CollectedError["context"]["lastAction"];

const captureAction = (type: string) => (e: Event) => {
  lastAction = {
    type,
    target: formatTarget(e.target),
    text: safeText(e.target),
    at: new Date().toISOString(),
  };
};

const buildContext = (): CollectedError["context"] => ({
  url: window.location.href,
  pathname: window.location.pathname + window.location.search,
  viewport: `${window.innerWidth}x${window.innerHeight}`,
  userAgent: navigator.userAgent,
  lastAction,
});

const argsToMessage = (args: unknown[]): string =>
  args
    .map((a) => {
      if (a instanceof Error) return `${a.name}: ${a.message}`;
      if (typeof a === "string") return a;
      try {
        return JSON.stringify(a);
      } catch {
        return String(a);
      }
    })
    .join(" ");

const argsToStack = (args: unknown[]): string | undefined => {
  for (const a of args) {
    if (a instanceof Error && a.stack) return a.stack;
  }
  return undefined;
};

const record = (entry: Omit<CollectedError, "id" | "timestamp" | "context">) => {
  const collected: CollectedError = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    context: buildContext(),
    ...entry,
  };
  const buf = (window.__appErrors ||= []);
  buf.push(collected);
  if (buf.length > MAX_BUFFER) buf.splice(0, buf.length - MAX_BUFFER);

  // 그룹 출력 (원본 console.error/warn은 이미 호출된 후이거나 별도 경로)
  const label = `🚨 [AppError] ${collected.source} @ ${collected.context.pathname}`;
  // eslint-disable-next-line no-console
  console.groupCollapsed(label);
  // eslint-disable-next-line no-console
  console.log("message:", collected.message);
  if (collected.stack) {
    // eslint-disable-next-line no-console
    console.log("stack:", collected.stack);
  }
  // eslint-disable-next-line no-console
  console.log("context:", collected.context);
  // eslint-disable-next-line no-console
  console.groupEnd();
};

export function downloadAppErrors() {
  const errors = window.__appErrors ?? [];
  if (errors.length === 0) {
    // eslint-disable-next-line no-console
    console.info("[errorCollector] 수집된 애플리케이션 오류가 없습니다.");
    return;
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    count: errors.length,
    errors,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `app-errors_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // eslint-disable-next-line no-console
  console.info(`[errorCollector] ${errors.length}개의 오류를 JSON으로 다운로드했습니다.`);
}

export function isErrorCollectorActive(): boolean {
  return typeof window !== "undefined" && !!window.__appErrors;
}

export function getErrorCount(): number {
  return window.__appErrors?.length ?? 0;
}

export function initErrorCollector() {
  if (initialized || typeof window === "undefined") return;

  const flag = (import.meta.env.VITE_ERROR_COLLECT as string | undefined)?.toLowerCase();
  const enabled = flag ? flag === "on" : import.meta.env.DEV;
  if (!enabled) return;

  initialized = true;

  // 1) 사용자 행동 추적 (캡처 단계, passive)
  window.addEventListener("click", captureAction("click"), { capture: true, passive: true });
  window.addEventListener("input", captureAction("input"), { capture: true, passive: true });
  window.addEventListener("submit", captureAction("submit"), { capture: true, passive: true });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === "Escape") captureAction(`keydown:${e.key}`)(e);
  }, { capture: true, passive: true });

  // 2) console.error / console.warn 후킹 (Failed/Error 키워드 필터)
  const origError = console.error.bind(console);
  const origWarn = console.warn.bind(console);

  console.error = (...args: unknown[]) => {
    origError(...args);
    const msg = argsToMessage(args);
    if (KEYWORDS.test(msg)) {
      record({ source: "console.error", message: msg, stack: argsToStack(args) });
    }
  };

  console.warn = (...args: unknown[]) => {
    origWarn(...args);
    const msg = argsToMessage(args);
    if (KEYWORDS.test(msg)) {
      record({ source: "console.warn", message: msg, stack: argsToStack(args) });
    }
  };

  // 3) 전역 에러
  window.addEventListener("error", (e) => {
    record({
      source: "window.error",
      message: e.message || "Unknown error",
      stack: e.error?.stack,
    });
  });

  // 4) Promise rejection
  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    const message =
      reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason);
    record({
      source: "unhandledrejection",
      message,
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });

  // 5) 디버깅 헬퍼
  window.__dumpAppErrors = () => window.__appErrors ?? [];
  window.__clearAppErrors = () => {
    window.__appErrors = [];
  };
  window.__downloadAppErrors = downloadAppErrors;

  // eslint-disable-next-line no-console
  console.info(
    "[errorCollector] 활성화됨. window.__dumpAppErrors() / window.__downloadAppErrors() 로 수집된 에러를 확인·다운로드할 수 있습니다."
  );
}
