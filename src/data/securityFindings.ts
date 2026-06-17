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

export interface ScanHistoryEntry {
  date: string; // ISO date
  scanner: ScannerName;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  note?: string;
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

// Append a new entry after each scan run to track findings changes over time.
// Most recent entries should be at the end.
export const SCAN_HISTORY: ScanHistoryEntry[] = [
  // agent_security
  { date: "2025-11-12", scanner: "agent_security", total: 3, critical: 0, high: 1, medium: 2, low: 0, info: 0, note: "Initial baseline scan" },
  { date: "2025-12-20", scanner: "agent_security", total: 1, critical: 0, high: 0, medium: 1, low: 0, info: 0, note: "Resolved 2 findings" },
  { date: "2026-02-09", scanner: "agent_security", total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0, note: "All clear" },

  // connector_security_scan (Wiz)
  { date: "2026-03-15", scanner: "connector_security_scan", total: 2, critical: 0, high: 0, medium: 1, low: 1, info: 0, note: "Wiz initial scan" },
  { date: "2026-05-01", scanner: "connector_security_scan", total: 1, critical: 0, high: 0, medium: 0, low: 1, info: 0 },
  { date: "2026-06-16", scanner: "connector_security_scan", total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0, note: "All clear" },

  // supabase linter
  { date: "2026-04-10", scanner: "supabase", total: 4, critical: 1, high: 1, medium: 2, low: 0, info: 0, note: "Missing RLS policies" },
  { date: "2026-05-22", scanner: "supabase", total: 2, critical: 0, high: 0, medium: 2, low: 0, info: 0, note: "Fixed RLS issues" },
  { date: "2026-06-16", scanner: "supabase", total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0, note: "All clear" },

  // supabase_lov
  { date: "2026-05-05", scanner: "supabase_lov", total: 2, critical: 0, high: 0, medium: 0, low: 0, info: 2, note: "Informational findings" },
  { date: "2026-06-01", scanner: "supabase_lov", total: 2, critical: 0, high: 0, medium: 0, low: 0, info: 2, note: "Ignored as intentional (immutable design)" },
  { date: "2026-06-16", scanner: "supabase_lov", total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0, note: "All clear" },
];

