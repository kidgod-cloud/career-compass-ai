import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ProfileData } from "@/hooks/useProfile";

interface Props {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
}

export function SkillsSection({ profile, setProfile }: Props) {
  const [newSkill, setNewSkill] = useState("");

  const handleAdd = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || profile.skills.includes(trimmed)) { setNewSkill(""); return; }
    setProfile(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setNewSkill("");
  };

  const handleRemove = (index: number) => {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  return (
    <div className="space-y-2">
      <Label>보유 기술</Label>
      <div className="flex gap-2">
        <Input
          placeholder="기술명 입력 후 Enter 또는 추가 버튼"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
        />
        <Button type="button" variant="outline" onClick={handleAdd} disabled={!newSkill.trim()}>
          추가
        </Button>
      </div>
      {profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {profile.skills.map((skill, i) => (
            <Badge key={i} variant="secondary" className="gap-1 pr-1 cursor-pointer group">
              {skill}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`${skill} 삭제`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {profile.skills.length === 0 && (
        <p className="text-sm text-muted-foreground">등록된 기술이 없습니다.</p>
      )}
    </div>
  );
}
