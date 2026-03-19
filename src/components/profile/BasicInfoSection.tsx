import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileData } from "@/hooks/useProfile";

const industries = [
  "IT/소프트웨어", "금융/은행", "제조업", "의료/헬스케어", "교육",
  "마케팅/광고", "컨설팅", "미디어/엔터테인먼트", "유통/물류", "기타",
];

interface Props {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
}

export function BasicInfoSection({ profile, setProfile }: Props) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="full_name">이름</Label>
        <Input
          id="full_name"
          placeholder="홍길동"
          value={profile.full_name}
          onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="job_title">현재 직무</Label>
        <Input
          id="job_title"
          placeholder="예: 소프트웨어 엔지니어"
          value={profile.job_title}
          onChange={(e) => setProfile(prev => ({ ...prev, job_title: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_job">목표 직무</Label>
        <Input
          id="target_job"
          placeholder="예: 시니어 백엔드 개발자"
          value={profile.target_job}
          onChange={(e) => setProfile(prev => ({ ...prev, target_job: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">업계</Label>
        <Select
          value={profile.industry}
          onValueChange={(value) => setProfile(prev => ({ ...prev, industry: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="업계를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((ind) => (
              <SelectItem key={ind} value={ind}>{ind}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience_years">경력 연수</Label>
        <Input
          id="experience_years"
          type="number"
          min="0"
          max="50"
          placeholder="예: 5"
          value={profile.experience_years ?? ""}
          onChange={(e) =>
            setProfile(prev => ({
              ...prev,
              experience_years: e.target.value ? parseInt(e.target.value) : null,
            }))
          }
        />
      </div>
    </>
  );
}
