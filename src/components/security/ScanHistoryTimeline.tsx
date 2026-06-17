import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ArrowDown, ArrowUp, Minus, History } from "lucide-react";
import { SECURITY_SNAPSHOT, SCAN_HISTORY, type ScannerName } from "@/data/securityFindings";

const chartConfig = {
  total: { label: "Total findings", color: "hsl(var(--primary))" },
  critical: { label: "Critical", color: "hsl(var(--destructive))" },
  high: { label: "High", color: "hsl(var(--destructive))" },
  medium: { label: "Medium", color: "hsl(var(--primary))" },
  low: { label: "Low", color: "hsl(var(--muted-foreground))" },
} satisfies ChartConfig;

function TrendDelta({ prev, curr }: { prev?: number; curr: number }) {
  if (prev === undefined) return null;
  const diff = curr - prev;
  if (diff === 0)
    return (
      <span className="inline-flex items-center text-xs text-muted-foreground">
        <Minus className="w-3 h-3" /> 0
      </span>
    );
  if (diff < 0)
    return (
      <span className="inline-flex items-center text-xs text-green-600 dark:text-green-400">
        <ArrowDown className="w-3 h-3" /> {Math.abs(diff)}
      </span>
    );
  return (
    <span className="inline-flex items-center text-xs text-destructive">
      <ArrowUp className="w-3 h-3" /> {diff}
    </span>
  );
}

export function ScanHistoryTimeline({ scanner }: { scanner?: ScannerName }) {
  const scanners = scanner
    ? SECURITY_SNAPSHOT.filter((s) => s.scanner === scanner)
    : SECURITY_SNAPSHOT;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <div>
            <CardTitle>Scan History Timeline</CardTitle>
            <CardDescription>
              Findings changes over time per scanner.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {scanners.map((s) => {
          const entries = SCAN_HISTORY.filter((e) => e.scanner === s.scanner).sort(
            (a, b) => a.date.localeCompare(b.date),
          );
          return <ScannerSection key={s.scanner} label={s.label} entries={entries} />;
        })}
      </CardContent>
    </Card>
  );
}

function ScannerSection({
  label,
  entries,
}: {
  label: string;
  entries: ReturnType<typeof Array.prototype.slice> & { length: number };
}) {
  const data = useMemo(
    () =>
      (entries as any[]).map((e) => ({
        date: e.date,
        total: e.total,
        critical: e.critical,
        high: e.high,
        medium: e.medium,
        low: e.low,
      })),
    [entries],
  );

  if (entries.length === 0) {
    return (
      <div>
        <h3 className="font-semibold text-sm mb-2">{label}</h3>
        <p className="text-xs text-muted-foreground">No scan history recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-sm">{label}</h3>
        <span className="text-xs text-muted-foreground">
          {entries.length} scan{entries.length === 1 ? "" : "s"} recorded
        </span>
      </div>

      <ChartContainer config={chartConfig} className="h-[180px] w-full">
        <LineChart data={data} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="total"
            type="monotone"
            stroke="var(--color-total)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line dataKey="critical" type="monotone" stroke="var(--color-critical)" strokeWidth={1.5} dot={false} />
          <Line dataKey="high" type="monotone" stroke="var(--color-high)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
        </LineChart>
      </ChartContainer>

      <ol className="relative border-l border-border ml-2 space-y-3">
        {(entries as any[])
          .slice()
          .reverse()
          .map((e, i, arr) => {
            const prev = arr[i + 1]?.total;
            return (
              <li key={e.date} className="ml-4">
                <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-primary border border-background" />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{e.date}</span>
                  <Badge variant={e.total === 0 ? "default" : "destructive"}>
                    {e.total} finding{e.total === 1 ? "" : "s"}
                  </Badge>
                  <TrendDelta prev={prev} curr={e.total} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3">
                  {e.critical > 0 && <span>critical: {e.critical}</span>}
                  {e.high > 0 && <span>high: {e.high}</span>}
                  {e.medium > 0 && <span>medium: {e.medium}</span>}
                  {e.low > 0 && <span>low: {e.low}</span>}
                  {e.info > 0 && <span>info: {e.info}</span>}
                </div>
                {e.note && <p className="text-xs text-muted-foreground mt-1">{e.note}</p>}
              </li>
            );
          })}
      </ol>
    </div>
  );
}
