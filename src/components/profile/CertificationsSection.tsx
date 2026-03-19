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

export function CertificationsSection({ profile, setProfile }: Props) {
  const [newCert, setNewCert] = useState("");

  const handleAdd = () => {
    const trimmed = newCert.trim();
    if (!trimmed || profile.certifications.includes(trimmed)) { setNewCert(""); return; }
    setProfile(prev => ({ ...prev, certifications: [...prev.certifications, trimmed] }));
    setNewCert("");
  };

  return (
    <div className="space-y-2">
      <Label>자격증</Label>
      <div className="flex gap-2">
        <Input
          placeholder="자격증명 입력 후 Enter 또는 추가 버튼"
          value={newCert}
          onChange={(e) => setNewCert(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
        />
        <Button type="button" variant="outline" onClick={handleAdd} disabled={!newCert.trim()}>
          추가
        </Button>
      </div>
      {profile.certifications.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {profile.certifications.map((cert, i) => (
            <Badge key={i} variant="outline" className="gap-1 pr-1 cursor-pointer group">
              {cert}
              <button
                type="button"
                onClick={() => setProfile(prev => ({ ...prev, certifications: prev.certifications.filter((_, idx) => idx !== i) }))}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`${cert} 삭제`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {profile.certifications.length === 0 && (
        <p className="text-sm text-muted-foreground">등록된 자격증이 없습니다.</p>
      )}
    </div>
  );
}
