import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

export interface Education {
  school: string;
  degree: string;
  major: string;
  year: string;
}

interface Props {
  items: Education[];
  onChange: (items: Education[]) => void;
}

const emptyItem: Education = { school: "", degree: "", major: "", year: "" };

export function EducationEditor({ items, onChange }: Props) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Education>(emptyItem);
  const [isAdding, setIsAdding] = useState(false);

  const startAdd = () => { setDraft(emptyItem); setIsAdding(true); setEditIndex(null); };
  const startEdit = (i: number) => { setDraft({ ...items[i] }); setEditIndex(i); setIsAdding(false); };
  const cancel = () => { setIsAdding(false); setEditIndex(null); setDraft(emptyItem); };

  const save = () => {
    if (!draft.school.trim() || !draft.degree.trim()) return;
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
        <Label>학력사항</Label>
        {!isEditing && (
          <Button type="button" variant="outline" size="sm" onClick={startAdd} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> 추가
          </Button>
        )}
      </div>

      {items.map((edu, i) =>
        editIndex === i ? (
          <DraftForm key={i} draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} />
        ) : (
          <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm flex items-start justify-between gap-2 group">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{edu.degree} · {edu.school}</p>
              <p className="text-muted-foreground">{edu.major}{edu.year && ` · ${edu.year}`}</p>
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

      {isAdding && <DraftForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} />}

      {items.length === 0 && !isAdding && (
        <p className="text-sm text-muted-foreground">등록된 학력사항이 없습니다.</p>
      )}
    </div>
  );
}

function DraftForm({ draft, setDraft, onSave, onCancel }: {
  draft: Education; setDraft: (d: Education) => void; onSave: () => void; onCancel: () => void;
}) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">학교명 *</Label>
          <Input placeholder="예: 서울대학교" value={draft.school} onChange={(e) => setDraft({ ...draft, school: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">학위 *</Label>
          <Input placeholder="예: 학사" value={draft.degree} onChange={(e) => setDraft({ ...draft, degree: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">전공</Label>
          <Input placeholder="예: 컴퓨터공학" value={draft.major} onChange={(e) => setDraft({ ...draft, major: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">졸업연도</Label>
          <Input placeholder="예: 2020" value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="gap-1">
          <X className="w-3.5 h-3.5" /> 취소
        </Button>
        <Button type="button" size="sm" onClick={onSave} disabled={!draft.school.trim() || !draft.degree.trim()} className="gap-1">
          <Check className="w-3.5 h-3.5" /> 저장
        </Button>
      </div>
    </div>
  );
}
