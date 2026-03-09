import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Loader2, CheckCircle2, X, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ParsedResume {
  full_name: string | null;
  job_title: string | null;
  target_job: string | null;
  industry: string | null;
  experience_years: number | null;
  skills: string[];
  education: Array<{ school: string; degree: string; major: string; year: string }>;
  work_experience: Array<{ company: string; position: string; period: string; description: string }>;
  certifications: string[];
  summary: string | null;
  resume_text: string | null;
}

interface ResumeUploadProps {
  onParsed: (data: ParsedResume) => void;
  compact?: boolean;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";

export function ResumeUpload({ onParsed, compact = false }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 20 * 1024 * 1024) {
      toast({ title: "파일 크기 초과", description: "20MB 이하의 파일만 업로드 가능합니다.", variant: "destructive" });
      return;
    }

    setFile(selected);
    setParsed(false);
  };

  const handleUploadAndParse = async () => {
    if (!file) return;

    setParsing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "로그인이 필요합니다.", variant: "destructive" });
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-resume`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "이력서 파싱에 실패했습니다.");
      }

      const data = await response.json();

      if (data.parsed) {
        onParsed(data.parsed);
        setParsed(true);
        toast({ title: "이력서 분석 완료", description: "정보가 자동으로 입력되었습니다." });
      } else {
        throw new Error("파싱 결과가 없습니다.");
      }
    } catch (error: any) {
      console.error("Resume parse error:", error);
      toast({ title: "이력서 분석 실패", description: error.message, variant: "destructive" });
    } finally {
      setParsing(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setParsed(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="h-8 w-8 text-muted-foreground" />;
    const name = file.name.toLowerCase();
    if (/\.(jpg|jpeg|png|webp)$/.test(name)) return <Image className="h-8 w-8 text-primary" />;
    return <FileText className="h-8 w-8 text-primary" />;
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={parsing}
          >
            <Upload className="h-4 w-4 mr-2" />
            이력서 업로드
          </Button>
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="truncate max-w-[200px]">{file.name}</span>
              <button onClick={handleRemove} className="hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {file && !parsed && (
            <Button type="button" size="sm" onClick={handleUploadAndParse} disabled={parsing}>
              {parsing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {parsing ? "분석 중..." : "자동 인식"}
            </Button>
          )}
          {parsed && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" /> 완료
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileSelect}
          className="hidden"
        />

        {!file ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center gap-3 py-8 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Upload className="h-10 w-10" />
            <div className="text-center">
              <p className="font-medium">이력서 파일을 업로드하세요</p>
              <p className="text-sm mt-1">PDF, DOCX, 이미지(JPG/PNG) 지원 · 최대 20MB</p>
            </div>
          </button>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {getFileIcon()}
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {parsed ? (
                <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> 분석 완료
                </span>
              ) : (
                <Button type="button" onClick={handleUploadAndParse} disabled={parsing} size="sm">
                  {parsing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      AI 분석 중...
                    </>
                  ) : (
                    "자동 인식"
                  )}
                </Button>
              )}
              <Button type="button" variant="ghost" size="icon" onClick={handleRemove} disabled={parsing}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
