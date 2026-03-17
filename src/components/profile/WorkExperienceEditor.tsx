import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

export interface WorkExperience {
  company: string;
  position: string;
  period: string;
  description: string;
}

interface Props {
  items: WorkExperience[];
  onChange: (items: WorkExperience[]) => void;
}

const emptyItem: WorkExperience = { company: "", position: "", period: "", description: "" };

export function WorkExperienceEditor({ items, onChange }: Props) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<WorkExperience>(emptyItem);
  const [isAdding, setIsAdding] = useState(false);

  const startAdd = () => {
    setDraft(emptyItem);
    setIsAdding(true);
    setEditIndex(null);
  };

  const startEdit = (i: number) => {
    setDraft({ ...items[i] });
    setEditIndex(i);
    setIsAdding(false);
  };

  const cancel = () => {
    setIsAdding(false);
    setEditIndex(null);
    setDraft(emptyItem);
  };

  const save = () => {
    if (!draft.company.trim() || !draft.position.trim()) return;
    if (isAdding) {
      onChange([...items, draft]);
    } else if (editIndex !== null) {
      const updated = [...items];
      updated[editIndex] = draft;
      onChange(updated);
    }
    cancel();
  };

  const remove = (i: number) => {
    onChange(items.filter((_, idx) => idx !== i));
    if (editIndex === i) cancel();
  };

  const isEditing = isAdding || editIndex !== null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>경력사항</Label>
        {!isEditing && (
          <Button type="button" variant="outline" size="sm" onClick={startAdd} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> 추가
          </Button>
        )}
      </div>

      {/* Existing items */}
      {items.map((exp, i) =>
        editIndex === i ? (
          <DraftForm key={i} draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} />
        ) : (
          <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm flex items-start justify-between gap-2 group">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{exp.position} · {exp.company}</p>
              <p className="text-muted-foreground">{exp.period}</p>
              {exp.description && <p className="text-muted-foreground mt-1 whitespace-pre-line">{exp.description}</p>}
            </div>
            {!isEditing && (
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(i)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(i)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        )
      )}

      {/* Add form */}
      {isAdding && <DraftForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} />}

      {items.length === 0 && !isAdding && (
        <p className="text-sm text-muted-foreground">등록된 경력사항이 없습니다.</p>
      )}
    </div>
  );
}

function DraftForm({
  draft, setDraft, onSave, onCancel,
}: {
  draft: WorkExperience;
  setDraft: (d: WorkExperience) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">회사명 *</Label>
          <Input placeholder="예: 삼성전자" value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">직위 *</Label>
          <Input placeholder="예: 시니어 개발자" value={draft.position} onChange={(e) => setDraft({ ...draft, position: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">기간</Label>
        <Input placeholder="예: 2020.03 - 2024.01" value={draft.period} onChange={(e) => setDraft({ ...draft, period: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">업무 설명</Label>
        <Textarea placeholder="주요 업무 내용을 입력하세요" rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="gap-1">
          <X className="w-3.5 h-3.5" /> 취소
        </Button>
        <Button type="button" size="sm" onClick={onSave} disabled={!draft.company.trim() || !draft.position.trim()} className="gap-1">
          <Check className="w-3.5 h-3.5" /> 저장
        </Button>
      </div>
    </div>
  );
}

