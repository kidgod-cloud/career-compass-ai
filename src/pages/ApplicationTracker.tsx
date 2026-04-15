import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Compass, Plus, Pencil, Trash2, Briefcase, ExternalLink, Loader2, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["평가", "지원", "면접", "오퍼", "합격", "불합격"] as const;
type AppStatus = typeof STATUSES[number];

interface Application {
  id: string;
  company: string;
  position: string;
  status: AppStatus;
  notes: string | null;
  url: string | null;
  applied_at: string | null;
  created_at: string;
}

interface FitEval {
  id: string;
  grade: string;
  score: number;
  job_posting: string;
}

const gradeColors: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  C: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  D: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  E: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  F: "bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-300",
};

const statusColors: Record<AppStatus, string> = {
  "평가": "bg-muted text-muted-foreground",
  "지원": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "면접": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "오퍼": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "합격": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  "불합격": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const emptyForm = { company: "", position: "", status: "평가" as AppStatus, notes: "", url: "", applied_at: "" };

export default function ApplicationTracker() {
  const [apps, setApps] = useState<Application[]>([]);
  const [evals, setEvals] = useState<FitEval[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      fetchApps();
      fetchEvals();
  }, [navigate]);

  const fetchApps = async () => {
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setApps(data as unknown as Application[]);
    }
    setLoading(false);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (app: Application) => {
    setEditingId(app.id);
    setForm({
      company: app.company,
      position: app.position,
      status: app.status,
      notes: app.notes || "",
      url: app.url || "",
      applied_at: app.applied_at || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.company.trim() || !form.position.trim()) {
      toast({ variant: "destructive", title: "회사명과 포지션을 입력해주세요." });
      return;
    }

    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const payload = {
      company: form.company.trim(),
      position: form.position.trim(),
      status: form.status,
      notes: form.notes.trim() || null,
      url: form.url.trim() || null,
      applied_at: form.applied_at || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("job_applications").update(payload as any).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("job_applications").insert({ ...payload, user_id: session.user.id } as any));
    }

    setSaving(false);
    if (error) {
      toast({ variant: "destructive", title: "저장 실패", description: error.message });
      return;
    }

    toast({ title: editingId ? "수정 완료" : "추가 완료" });
    setDialogOpen(false);
    fetchApps();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("job_applications").delete().eq("id", id);
    if (!error) {
      setApps(prev => prev.filter(a => a.id !== id));
      toast({ title: "삭제 완료" });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("job_applications").update({ status: newStatus } as any).eq("id", id);
    if (!error) {
      setApps(prev => prev.map(a => a.id === id ? { ...a, status: newStatus as AppStatus } : a));
    }
  };

  const filtered = filterStatus === "all" ? apps : apps.filter(a => a.status === filterStatus);

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link to="/" className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Compass className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl text-foreground">
                  Career<span className="text-gradient">Shift</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">지원 현황 트래커</h1>
              <p className="text-muted-foreground text-sm">총 {apps.length}건</p>
            </div>
          </div>
          <Button onClick={openNew}>
            <Plus className="w-4 h-4 mr-2" />
            새 지원 추가
          </Button>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
              className={`rounded-lg p-2.5 text-center transition-all border ${
                filterStatus === s ? "ring-2 ring-primary border-primary" : "border-border"
              }`}
            >
              <div className="text-lg font-bold text-foreground">{statusCounts[s]}</div>
              <div className="text-xs text-muted-foreground">{s}</div>
            </button>
          ))}
        </div>

        {/* Application list */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {apps.length === 0 ? "아직 추가된 지원 내역이 없습니다." : "해당 상태의 지원 내역이 없습니다."}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(app => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{app.company}</h3>
                        {app.url && (
                          <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary shrink-0">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{app.position}</p>
                      {app.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{app.notes}</p>}
                      {app.applied_at && <p className="text-xs text-muted-foreground mt-1">지원일: {app.applied_at}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select value={app.status} onValueChange={(v) => handleStatusChange(app.id, v)}>
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <Badge className={`${statusColors[app.status]} text-xs px-1.5 py-0`}>{app.status}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(app)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(app.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "지원 내역 수정" : "새 지원 추가"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>회사명 *</Label>
                <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="예: 삼성전자" />
              </div>
              <div>
                <Label>포지션 *</Label>
                <Input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="예: 프론트엔드 개발자" />
              </div>
              <div>
                <Label>상태</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as AppStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>채용공고 URL</Label>
                <Input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <Label>지원일</Label>
                <Input type="date" value={form.applied_at} onChange={e => setForm(f => ({ ...f, applied_at: e.target.value }))} />
              </div>
              <div>
                <Label>메모</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="면접 일정, 연락처 등" rows={3} />
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />저장 중...</> : editingId ? "수정 완료" : "추가하기"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
