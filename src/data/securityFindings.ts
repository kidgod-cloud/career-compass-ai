// Aggregated security findings across all scanners.
// Update this file after running scans (see README "CI & branch protection").

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type ScannerName =
  | "agent_security"
  | "connector_security_scan"
  | "supabase"
  | "supabase_lov";

export interface SecurityFinding {
  id: string;
  scanner: ScannerName;
  source?: string; // e.g. "Wiz" for connector_security_scan
  title: string;
  severity: Severity;
  status: "open" | "fixed" | "ignored";
  description?: string;
  remediation?: string;
  detectedAt: string; // ISO date
}

export interface ScannerSummary {
  scanner: ScannerName;
  label: string;
  lastScan: string;
  findings: SecurityFinding[];
}

// Latest snapshot — all scanners returned 0 findings.
export const SECURITY_SNAPSHOT: ScannerSummary[] = [
  {
    scanner: "agent_security",
    label: "Agent Security",
    lastScan: "2026-02-09",
    findings: [],
  },
  {
    scanner: "connector_security_scan",
    label: "Connector Security (Wiz)",
    lastScan: "2026-06-16",
    findings: [],
  },
  {
    scanner: "supabase",
    label: "Supabase Linter",
    lastScan: "2026-06-16",
    findings: [],
  },
  {
    scanner: "supabase_lov",
    label: "Supabase (Lovable)",
    lastScan: "2026-06-16",
    findings: [],
  },
];
