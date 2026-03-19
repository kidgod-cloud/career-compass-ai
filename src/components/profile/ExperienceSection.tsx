import { ProfileData } from "@/hooks/useProfile";
import { WorkExperienceEditor } from "./WorkExperienceEditor";
import { EducationEditor } from "./EducationEditor";

interface Props {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
}

export function ExperienceSection({ profile, setProfile }: Props) {
  return (
    <div className="space-y-8">
      <WorkExperienceEditor
        items={profile.work_experience}
        onChange={(items) => setProfile(prev => ({ ...prev, work_experience: items }))}
      />
      <EducationEditor
        items={profile.education}
        onChange={(items) => setProfile(prev => ({ ...prev, education: items }))}
      />
    </div>
  );
}
