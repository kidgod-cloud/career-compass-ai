import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { SECURITY_SNAPSHOT, type Severity, type SecurityFinding } from "@/data/securityFindings";
import { ScanHistoryTimeline } from "@/components/security/ScanHistoryTimeline";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

const severityVariant = (s: Severity) =>
  s === "critical" || s === "high"
    ? "destructive"
    : s === "medium"
      ? "default"
      : "secondary";

const statusVariant = (s: SecurityFinding["status"]) =>
  s === "open" ? "destructive" : s === "fixed" ? "default" : "secondary";

export default function SecurityTriage() {
  const [filter, setFilter] = useState<"all" | Severity>("all");

  const all = useMemo(
    () => SECURITY_SNAPSHOT.flatMap((s) => s.findings.map((f) => ({ ...f, _scanner: s.label }))),
    [],
  );

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    all.forEach((f) => {
      if (f.status === "open") c[f.severity]++;
    });
    return c;
  }, [all]);

  const visible = filter === "all" ? all : all.filter((f) => f.severity === filter);
  const totalOpen = SEVERITY_ORDER.reduce((n, s) => n + counts[s], 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" />
              Security Triage
            </h1>
            <p className="text-muted-foreground mt-1">
              Aggregated findings from all scanners in one place.
            </p>
          </div>
          {totalOpen === 0 ? (
            <Badge variant="default" className="gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> All clear
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> {totalOpen} open
            </Badge>
          )}
        </div>

        {/* Severity summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {SEVERITY_ORDER.map((s) => (
            <Card
              key={s}
              className={`cursor-pointer transition ${filter === s ? "ring-2 ring-primary" : ""}`}
              onClick={() => setFilter(filter === s ? "all" : s)}
            >
              <CardHeader className="pb-2">
                <CardDescription className="capitalize">{s}</CardDescription>
                <CardTitle className="text-2xl">{counts[s]}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Scanner tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">All ({all.length})</TabsTrigger>
            {SECURITY_SNAPSHOT.map((s) => (
              <TabsTrigger key={s.scanner} value={s.scanner}>
                {s.label} ({s.findings.length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <FindingsTable
              findings={visible}
              emptyMessage="No findings across any scanner. Project is clean."
            />
          </TabsContent>

          {SECURITY_SNAPSHOT.map((s) => (
            <TabsContent key={s.scanner} value={s.scanner} className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div>
                      <CardTitle>{s.label}</CardTitle>
                      <CardDescription>Last scan: {s.lastScan}</CardDescription>
                    </div>
                    <Badge variant={s.findings.length === 0 ? "default" : "destructive"}>
                      {s.findings.length} findings
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FindingsTable
                    findings={s.findings.map((f) => ({ ...f, _scanner: s.label }))}
                    emptyMessage="No findings from this scanner."
                  />
                  <ScanHistoryTimeline scanner={s.scanner} />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <ScanHistoryTimeline />


        <Alert>
          <AlertTitle>How this updates</AlertTitle>
          <AlertDescription>
            Findings are sourced from <code>src/data/securityFindings.ts</code>. Re-run scans
            (agent_security, connector_security_scan including Wiz, supabase, supabase_lov)
            and update the snapshot to refresh this dashboard.
          </AlertDescription>
        </Alert>
      </main>
    </div>
  );
}

function FindingsTable({
  findings,
  emptyMessage,
}: {
  findings: (SecurityFinding & { _scanner?: string })[];
  emptyMessage: string;
}) {
  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShieldCheck className="w-12 h-12 text-primary mb-3" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Severity</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Scanner</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Detected</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {findings.map((f) => (
          <TableRow key={f.id}>
            <TableCell>
              <Badge variant={severityVariant(f.severity)} className="capitalize">
                {f.severity}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="font-medium">{f.title}</div>
              {f.description && (
                <div className="text-xs text-muted-foreground mt-0.5">{f.description}</div>
              )}
            </TableCell>
            <TableCell className="text-sm">
              {f._scanner}
              {f.source && <span className="text-muted-foreground"> · {f.source}</span>}
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant(f.status)} className="capitalize">
                {f.status}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{f.detectedAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
